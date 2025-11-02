import { useCallback, useEffect, useRef, useState } from "react";
import { authenticateByCookie, refreshAccessTokenByCookie, registerRequest, logoutRequest } from "../internal/identityApi";
import { parseJwt } from "../identity-util";
import AuthError from "../../general/errors/classes/AuthError";
import { create } from "zustand";

export type IdentityStateType = "authenticated" | "not_authenticated" | "error_authenticated" | "unknown";

export interface AuthenticateMethodProps {
    username: string;
    password: string;
    redirectUrl: string;
    client: string;
};

export interface RegisterProps {
    username: string;
    password: string;
    email: string;
};

export type IdentityStoreType = {
    state: IdentityStateType,
    myUserId: number | null,
    accessToken: string | null,
    authenticate: (props: AuthenticateMethodProps) => Promise<void>,
    logout: () => Promise<void>,
    refreshAccessToken: () => Promise<void>,
    alreadyRefreshAccessToken: boolean,
    refreshAccessTokenIntervalId: number | null,
    startIntervalRefreshToken: (intervalMillis: number) => void,
    stopIntervalRefreshToken: () => void,
    intervalRefreshTokenIsRunning: () => boolean
};

export const useIdentityStroe = create<IdentityStoreType>((set, get) => {
    
    function setIntervalRefreshAccessTokenId(id: number | null) {
        set({ refreshAccessTokenIntervalId: id });
    }

    function clearIntervalRefreshAccessTokenId() {
        const id = get().refreshAccessTokenIntervalId;
        if (id !== null && typeof id === "number") {
            clearInterval(id);
        }
        set({ refreshAccessTokenIntervalId: null });
    }

    function setAccessToken(token: string | null) {
        set({ accessToken: token });
    }

    function setState(newState: IdentityStateType) {
        set({ state: newState });
    }

    function setMyUserId(userId: number | null) {
        set({ myUserId: userId });
    }

    function updateMyUserIdByAccessToken(): void {
        const token = get().accessToken;
        if (!token) {
            console.warn("Cannot set user ID, access token is not available.");
            return;
        }

        const parsed = parseJwt(token);
        const userId = parsed?.userId || null;
        if (userId === null) 
            throw new AuthError("myUserId === null => auth error.");
        setMyUserId(userId);
    }


    async function refreshAccessToken() {
        if (get().state !== "authenticated" && get().state !== "unknown") {
            console.warn("Cannot refresh access token, identity state is not authenticated.");
            return;
        }

        let alreadyRefreshAccessTokenItsYou = false;

        set((state) => {
            if (state.alreadyRefreshAccessToken) return {};
            alreadyRefreshAccessTokenItsYou = true;
            return { alreadyRefreshAccessToken: true };
        });
        if (!alreadyRefreshAccessTokenItsYou && get().alreadyRefreshAccessToken) {
            console.log("Access token already refreshed.");
            return;
        }

        try {
            console.log("!1!");
            const refreshedAccessToken: string | null = await refreshAccessTokenByCookie();
            console.log("!2!");
            console.log("Access token refreshed: ", refreshedAccessToken);

            if (!refreshedAccessToken || refreshedAccessToken.length <= 0) {
                console.error("Failed to refresh access token.");
                setAccessToken(null);
                setState("not_authenticated");
                return;
            }

            setAccessToken(refreshedAccessToken);

            console.log("new access token: ", refreshedAccessToken);

            updateMyUserIdByAccessToken();

            if (get().myUserId)
                setState("authenticated");
            else
                setState("error_authenticated");
        } finally {
            set({ alreadyRefreshAccessToken: false });
        }
    }
    
    return {
        state: "unknown",
        myUserId: null,
        setMyUserId: (userId: number | null) => {
            set({ myUserId: userId });
        },
        accessToken: null,
        refreshAccessTokenIntervalId: null,
        authenticate: (props: AuthenticateMethodProps): Promise<void> => {
            return authenticateByCookie({
                grantType: "cookie",
                client: props.client,
                redirectUrl: props.redirectUrl,
                username: props.username,
                password: props.password
            }).then(() => {
                console.log("authenticate success");
                setState("authenticated");
            }).catch((error) => {
                console.error("Authorization failed:", error);
                setState("error_authenticated");
            });
        },
        refreshAccessToken: refreshAccessToken,
        alreadyRefreshAccessToken: false,
        startIntervalRefreshToken: (intervalMillis: number) => {
            // если уже запущено — не запускать второй раз
            if (get().refreshAccessTokenIntervalId !== null) return;
            // Сразу выполнить рефреш один раз (опционально) — можно убрать
            void get().refreshAccessToken();

            const id = window.setInterval(() => {
                void get().refreshAccessToken();
            }, intervalMillis);

            setIntervalRefreshAccessTokenId(id);
        },
        stopIntervalRefreshToken: () => {
            clearIntervalRefreshAccessTokenId();
        },
        intervalRefreshTokenIsRunning: () => get().refreshAccessTokenIntervalId !== null,
        logout: (): Promise<void> => {
            return logoutRequest().then(() => {
                setAccessToken(null);
                setState("not_authenticated");
                get().stopIntervalRefreshToken();
            });
        }
    };
});


export function useIdentity() {    
    /*
        Аунтификацией считаеться наличие валидного refreshToken в cookie. 
        Как только authenticated станет равным "authenticated" => нужно запросить accessToken
    */
    const state = useIdentityStroe(store => store.state);
    
    /*
        Id текущего пользователя.
        Храниться для удобного его получения, а именно UI, логика фронтенда и иногда бекенд.
    */
    const myUserId = useIdentityStroe(store => store.myUserId);
    /*
        Токен разрешения используемый для запросов к бекенду.
        Обновляеться с помощью функции refreshAccessToken (ищи ниже).
    */
    const accessToken = useIdentityStroe(store => store.accessToken);

    const startIntervalRefreshToken = useIdentityStroe(store => store.startIntervalRefreshToken);
    const stopIntervalRefreshToken = useIdentityStroe(store => store.stopIntervalRefreshToken);
    const refreshAccessTokenIntervalIsRunning = useIdentityStroe(store => store.intervalRefreshTokenIsRunning);

    const authenticate = useIdentityStroe(store => store.authenticate);
    const logout = useIdentityStroe(store => store.logout);


    //Функции

    const register = useCallback((props: RegisterProps): Promise<boolean> => {
        return registerRequest(props);
    }, []);

    const registerAndAuthenticate = useCallback((props: RegisterProps, beforeRedirectUrl: string): Promise<boolean> => {
        return registerRequest(props).then((result) => {
            if (result) {
                authenticate({client: "web", username: props.username, password: props.password, redirectUrl: beforeRedirectUrl});
            }
            return result;
        });
    }, []);

    //

    useEffect(() => {
        console.log("Identity state changed: ", state);
        //unknown потому что при startIntervalRefreshToken мы узнаем not authenticated или authenticated
        if ((state === "authenticated" || state === "unknown") && !refreshAccessTokenIntervalIsRunning()) {
            startIntervalRefreshToken(2 * 60 * 1000 * 0.75); //каждые 2 минуты - время возможной задержки в запросе  
        }
        else if (state !== "authenticated" && refreshAccessTokenIntervalIsRunning()) {
            stopIntervalRefreshToken();
        }
    }, [state]);

    return { 
        state, myUserId, accessToken, authenticate, register, registerAndAuthenticate, logout,
        startIntervalRefreshToken, stopIntervalRefreshToken, refreshAccessTokenIntervalIsRunning
     };
}