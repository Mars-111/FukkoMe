import { useCallback, useEffect, useRef, useState } from "react";
import { authenticateByCookie, refreshAccessTokenByCookie, registerRequest, logoutRequest } from "../internal/identityApi";
import { parseJwt } from "../identity-util";
import AuthError from "../../general/errors/classes/AuthError";


export type AuthenticatedType = "authenticated" | "not_authenticated" | "error_authenticated" | "unknown";

export interface AuthenticateMethodProps {
    username: string;
    password: string;
    redirectUrl: string;
    client: string;
}

export interface RegisterProps {
    username: string;
    password: string;
    email: string;
}

export function useIdentity() {
    /*
        Аунтификацией считаеться наличие валидного refreshToken в cookie. 
        Как только authenticated станет равным "authenticated" => нужно запросить accessToken
    */
    const [authenticated, setAuthenticated] = useState<AuthenticatedType>("unknown");
    /*
        Id текущего пользователя.
        Храниться для удобного его получения, а именно UI, логика фронтенда и иногда бекенд.
    */
    const [myUserId, setMyUserId] = useState<number | null>(null);
    /*
        Токен разрешения используемый для запросов к бекенду.
        Обновляеться с помощью функции refreshAccessToken (ищи ниже).
    */
    const accessToken = useRef<string | null>(null);

    const intervalRefreshAccessToken = useRef<ReturnType<typeof setTimeout> | null>(null);

    //Функции
    /*
        Grant type = cookie
    */
    const authenticate = useCallback((props: AuthenticateMethodProps): Promise<void> => {
        console.log("authenticate...");
        return authenticateByCookie({
            grantType: "cookie",
            client: props.client,
            redirectUrl: props.redirectUrl,
            username: props.username,
            password: props.password
        }).then(() => {
            setAuthenticated("authenticated");
        }).catch((error) => {
            console.error("Authorization failed:", error);
            setAuthenticated("error_authenticated");
        });
    }, []);

    const updateMyUserIdByAccessToken = useCallback(async (): Promise<void> => {
        if (!accessToken.current) {
            console.warn("Cannot set user ID, access token is not available.");
            return;
        }

        const parsed = parseJwt(accessToken.current);
        const userId = parsed?.userId || null;
        setMyUserId(userId);
        if (userId === null) 
            throw new AuthError("myUserId === null => auth error.");
    }, []);


    const refreshLogin = useCallback(async (): Promise<void> => {
        const refreshedAccessToken: string | null = await refreshAccessTokenByCookie();
        console.log("Access token refreshed: ", refreshedAccessToken);

        if (!refreshedAccessToken || refreshedAccessToken.length <= 0) {
            console.error("Failed to refresh access token.");
            accessToken.current = null;
            setAuthenticated("error_authenticated");
            return;
        }

        accessToken.current = refreshedAccessToken;

        await updateMyUserIdByAccessToken().then(() => {
            setAuthenticated("authenticated");
        }).catch(() => {
            setAuthenticated("error_authenticated")
        });
    }, [updateMyUserIdByAccessToken]);

    const stopRefreshAccessTokenInterval = useCallback((): void => {
        if (intervalRefreshAccessToken.current) {
            clearTimeout(intervalRefreshAccessToken.current);
            intervalRefreshAccessToken.current = null;
        }
    }, []);

    const startRefreshAccessTokenInterval = useCallback(async (): Promise<void> => {
        console.log("Starting access token refresh interval...");
        const scheduleNextRefresh = async () => {
            await refreshLogin();

            if (!accessToken.current) {
                console.warn("Access token is not set after refresh. Returning.");
                stopRefreshAccessTokenInterval();
                return;
            }

            const parsed = parseJwt(accessToken.current);
            const expiresAt: number = parsed?.exp || 0;
            if (expiresAt === 0) {
                console.error("Access token does not contain expiration time.");
                stopRefreshAccessTokenInterval();
                return;
            }
            else {
                console.log("Access token expires at:", expiresAt);
            }
            const now = Date.now();
            const expiresAtMs = expiresAt * 1000;
            const msUntilExpiration = expiresAtMs - now;
            console.log("expiresAtMs:", expiresAtMs, "now:", now, "msUntilExpiration:", msUntilExpiration);

            if (msUntilExpiration <= 0) {
                console.warn("Access token already expired or expires too soon.");
                return;
            }

            const refreshIn = msUntilExpiration * 0.9; // 10% до истечения
            console.log("Scheduling next refresh in ", refreshIn, "ms.");

            intervalRefreshAccessToken.current = setTimeout(scheduleNextRefresh, refreshIn);
        };
        intervalRefreshAccessToken.current = setTimeout(scheduleNextRefresh, 0);
    }, [refreshLogin, stopRefreshAccessTokenInterval]);

    const refreshAccessTokenIntervalIsRunning = useCallback((): boolean => {
        return intervalRefreshAccessToken.current !== null;
    }, []);

    const register = useCallback((props: RegisterProps): Promise<boolean> => {
        return registerRequest(props);
    }, []);

    const logout = useCallback((): Promise<void> => {
        return logoutRequest().then(() => {
            accessToken.current = null;
            setAuthenticated("not_authenticated");
            stopRefreshAccessTokenInterval();
        });
    }, [stopRefreshAccessTokenInterval]);

    const getAccessToken = useCallback((): string | null => {
        return accessToken.current;
    }, []);

    //

    useEffect(() => {
        if (authenticated === "unknown") {
            refreshLogin();
        }
    }, [authenticated, refreshLogin]);

    return { 
        authenticated, myUserId, getAccessToken, authenticate, register, logout,
        startRefreshAccessTokenInterval, stopRefreshAccessTokenInterval, refreshAccessTokenIntervalIsRunning
     };
}