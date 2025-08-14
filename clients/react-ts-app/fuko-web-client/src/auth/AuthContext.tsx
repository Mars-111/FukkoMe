import { createContext, useState, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { ChildrenType } from "../general/models/ChildrenType";
import { useIdentity, type AuthenticatedType, type AuthenticateMethodProps, type RegisterProps } from "./hooks/useIdentity";

type AuthContextType = {
    authenticated: AuthenticatedType, 
    myUserId: number | null, 
    authenticate: (props: AuthenticateMethodProps) => Promise<void>, 
    register: (props: RegisterProps) => Promise<boolean>, 
    logout: () => Promise<void>, 
    startRefreshAccessTokenInterval: () => Promise<void>, 
    stopRefreshAccessTokenInterval: () => void, 
    refreshAccessTokenIntervalIsRunning: () => boolean,
    getAccessToken: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({children}: ChildrenType): ReactNode => {
    const { 
        authenticated, 
        myUserId, 
        authenticate, 
        register, 
        logout,
        startRefreshAccessTokenInterval, 
        stopRefreshAccessTokenInterval, 
        refreshAccessTokenIntervalIsRunning,
        getAccessToken } = useIdentity();


    useEffect(() => {
        if (refreshAccessTokenIntervalIsRunning() || authenticated !== "authenticated") 
            return;
        startRefreshAccessTokenInterval();
        return () => {
            stopRefreshAccessTokenInterval();
        };
    }, [authenticated]);


    return (
        <AuthContext.Provider value={{ 
            authenticated, 
            myUserId, 
            authenticate, 
            register, 
            logout,
            startRefreshAccessTokenInterval, 
            stopRefreshAccessTokenInterval, 
            refreshAccessTokenIntervalIsRunning,
            getAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    )
}