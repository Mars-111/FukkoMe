import keycloak from "./keycloak";
import type { KeycloakTokenParsed } from "keycloak-js";


export function keycloakInitialized(): Promise<boolean> {
    if (keycloak.didInitialize) {
        return Promise.resolve(true);
    }
    return keycloak.init({ 
            onLoad: 'check-sso', 
            checkLoginIframe: false,
            silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
            pkceMethod: 'S256',
            flow: 'standard'
        });
}

export function keycloakSaveAction<T>(action: () => Promise<T>, context: string): Promise<T | null> {
    return keycloakInitialized()
        .then(() => action())
        .catch((error) => {
            console.error(`Keycloak initialization failed during ${context}:`, error);
            return null;
        });
}

export function login(redirectUri = window.location.origin): void {
    keycloakSaveAction<void>(async () => {
        if (!keycloak.authenticated) {
            await keycloak.login({
                redirectUri: redirectUri,
                prompt: 'login'
            });
        }
    }, "login");
}

export function register(redirectUri = window.location.origin): void {
    keycloakSaveAction<void>(async () => {
        if (!keycloak.authenticated) {
            await keycloak.register({
                redirectUri: redirectUri,
                prompt: 'login'
            });
        }
    }, "register");
}

export function logout(redirectUri = window.location.origin): void {
    keycloakSaveAction<void>(async () => {
        await keycloak.logout({ redirectUri: redirectUri });
    }, "logout");
}

export function refreshToken(minValidity = -1): Promise<boolean | null> {
    return keycloakSaveAction<boolean>(async () => {
        return await keycloak.updateToken(minValidity);
    }, "refreshToken");
}

export function getToken(): string | null {
    return keycloak.authenticated && keycloak.token ? keycloak.token : null;
}

export function getTokenParsed(): KeycloakTokenParsed | null {
    return keycloak.authenticated && keycloak.tokenParsed ? keycloak.tokenParsed : null;
}