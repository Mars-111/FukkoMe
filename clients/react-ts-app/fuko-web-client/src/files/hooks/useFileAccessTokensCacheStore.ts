import { create } from "zustand";


export type FileTokensStoreType = {
    filesToAccessTokenMap: Map<number, number>;
    accessTokensMap: Map<number, string>;
    getAccessTokenFromCache: (fileId: number) => string | undefined;
    setAccessTokenInCache: (fileIds: number[], fileAccessToken: string) => void;
    deleteToken: (tokenId: number) => void;
};


function asyncTimer(callback: () => void, ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            callback();
            resolve(); // <- говорим, что таймер завершился
        }, ms);
    });
}

function getFreeRandomKey<T>(map: Map<number, T>, max = 1_000_000): number {
    let key;
    do {
        key = Math.floor(Math.random() * max);
    } while (map.has(key));
    return key;
}

export const useFileAccessTokensCacheStore = create<FileTokensStoreType>((set, get) => ({
    filesToAccessTokenMap: new Map<number, number>(),
    accessTokensMap: new Map<number, string>(),
    getAccessTokenFromCache: (fileId: number): string | undefined => {
        const tokenId = get().accessTokensMap.get(fileId);
        if (!tokenId) {
            return undefined;
        }
        return get().accessTokensMap.get(fileId);
    },
    setAccessTokenInCache: (fileIds: number[], fileAccessToken: string) => {
        const currentTokensMap = new Map(get().accessTokensMap);
        const currentFileMap = new Map(get().filesToAccessTokenMap);
        const randomKey = getFreeRandomKey(currentTokensMap);
        currentTokensMap.set(randomKey, fileAccessToken);
        fileIds.forEach((id) => {
            currentFileMap.set(id, randomKey);
        });
        set({ filesToAccessTokenMap: currentFileMap, accessTokensMap: currentTokensMap});
        asyncTimer(() => get().deleteToken(randomKey), 1000 * 60 * 3);
    },
    deleteToken: (tokenId: number) => {
        const currentTokensMap = new Map(get().accessTokensMap);
        currentTokensMap.delete(tokenId);
        set({accessTokensMap: currentTokensMap});
    }
}));

