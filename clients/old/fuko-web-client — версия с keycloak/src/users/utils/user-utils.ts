import { getTokenParsed, refreshToken } from "../../auth/keycloak-utils";

export function getUserIdFromKeycloakToken(): number | null {
    const tokenParsed = getTokenParsed();
    return tokenParsed && tokenParsed.user_id ? tokenParsed.user_id : null;
}

export async function updateAndCheckTokenHasUserId(): Promise<boolean> {
    let userId: number | null = getUserIdFromKeycloakToken();
    if (userId !== null) {
        console.log("User ID already exists in token:", userId);
        return true;
    }
    await refreshToken();
    userId = getUserIdFromKeycloakToken();

    return userId !== null;
}