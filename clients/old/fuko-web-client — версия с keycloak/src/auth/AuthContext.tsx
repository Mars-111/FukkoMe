import { createContext, useEffect, useState, useMemo, useContext } from "react";
import type { ReactNode } from "react";
import keycloak from "./keycloak";
import { keycloakInitialized, login, register, logout, refreshToken, getToken } from "./keycloak-utils";
import type { ChildrenType } from "../models/ChildrenType";

type AuthContextType = {
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    login: (redirectUri?: string) => void;
    register: (redirectUri?: string) => void;
    logout: (redirectUri?: string) => void;
    refreshToken: (minValidity?: number) => void;
    getToken: () => string | null;
};

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isAuthLoading: false,
    login: () => {throw new Error("login function not implemented");},
    register: () => {throw new Error("register function not implemented");},
    logout: () => {throw new Error("logout function not implemented");},
    refreshToken: () => {throw new Error("refreshToken function not implemented");},
    getToken: () => {throw new Error("getToken function not implemented");},
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


export const AuthProvider = ({children}: ChildrenType): ReactNode => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
        


    useEffect(() => {
        keycloakInitialized().then(() => {
            setIsAuthenticated(keycloak.authenticated ? true : false);
        }).catch((error) => {
            console.error("Keycloak initialization failed:", error);
        });

        keycloak.onAuthSuccess = () => setIsAuthenticated(true);
        keycloak.onAuthLogout = () => setIsAuthenticated(false);
        keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).catch(() => setIsAuthenticated(false));
        };
        keycloak.onAuthRefreshError = () => setIsAuthenticated(false);
        keycloak.onReady = () => {
            setIsAuthenticated(keycloak.authenticated ? true : false);
            setIsAuthLoading(false); //Оставить тут 
        };


        return () => {
            keycloak.onAuthSuccess = undefined;
            keycloak.onAuthLogout = undefined;
            keycloak.onTokenExpired = undefined;
            keycloak.onAuthRefreshError = undefined;
            keycloak.onReady = undefined;
        };
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        isAuthenticated,
        isAuthLoading,
        login,
        register,
        logout,
        refreshToken,
        getToken
    }), [isAuthenticated, isAuthLoading]);


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}