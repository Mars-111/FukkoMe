import { useFileAccessTokensCacheStore } from "../../hooks/useFileAccessTokensCacheStore";
import type { FileType } from "../../models/fileType";



function getAllowedFilesFromAccessToken(accessToken: string): number[] {
    // JWT обычно в формате: header.payload.signature
    const parts = accessToken.split('.');
    if (parts.length < 2) {
        throw new Error('Invalid access token format');
    }

    try {
        const payloadBase64 = parts[1]
            .replace(/-/g, '+') // Base64Url → Base64
            .replace(/_/g, '/');
        
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        if (!Array.isArray(payload.fileIds)) {
            return [];
        }

        return payload.fileIds.map(Number);
    } catch (e) {
        console.error('Failed to decode access token', e);
        return [];
    }
}


export async function getAccessFileTokenFromCahce(fileId: number, orElseFetch: () => Promise<string>): Promise<string> {
    const tokenFromChache: string | undefined = useFileAccessTokensCacheStore.getState().getAccessTokenFromCache(fileId);
    if (tokenFromChache) {
        return Promise.resolve(tokenFromChache);
    }
    const tokenFromFetch = await orElseFetch();
    if (tokenFromFetch.length > 0) {
        const allowedFileIds: number[] = getAllowedFilesFromAccessToken(tokenFromFetch);
        useFileAccessTokensCacheStore.getState().setAccessTokenInCache(allowedFileIds, tokenFromFetch);
    }
    return tokenFromFetch;
}