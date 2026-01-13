import { create } from "zustand";

export type StateUser = {
    /*
        Список id пользователей, которых мы уже синхронизировали после входа.
        Если нету в списке - необходимо сверить версии с бекендом и при необхлдимости обновить пользователя.
    */
    syncUserIdsAfterOpenSet: Set<number>;
    addSyncUserIdsAfterOpen: (userId: number) => void; 
    /*
        С какого чата мы получили пользователя. 
        Это необходимо что бы контроллировать разрыв в данных между кешем и бекендом.
        Например, если если мы выйдем из чата и позже зайдем обратно, но пользователь обновился - мы это не узнаем.
        Следовательно, если cachedUsersFromMyChatsMap пустой, то мы можем считать, что данные в кеше не актуальны.
        key: userId, value: Set<chatId>
        P.S. Если появиться источник актуальных данных о пользователи по сокету кроме чатов, то Set<number> заменить на Set<Pair<Откуда, id этого места>>.
    */
    generalChatsWithUser: Map<number, Set<number>>;
    addGeneralChatsWithUser: (userId: number, chatId: number) => void;
    deleteGeneralChatsWithUser: (userId: number, chatId: number) => void;
    /*
        Нужно требуеться ли обновление? 
        Эти boolean говорят нам, нужно ли обнолять пользоватея, если он актуален?
    */
    requiredUserUpdateMap: Map<number, boolean>;
    setRequiredUserUpdate: (userId: number, required: boolean) => void;
    // /*
    //     Последняя проверка версии
    // */
    // lastCheckUserVersionMap: Map<number, number>;
    // setLastCheckUserVersion: (userId: number, instant?: number) => void;
};


export const useUserCacheMetaStore = create<StateUser>((set, get) => ({
    syncUserIdsAfterOpenSet: new Set<number>(),
    addSyncUserIdsAfterOpen: (userId: number) => {
        const currentSet = new Set(get().syncUserIdsAfterOpenSet);
        currentSet.add(userId);
        set({ syncUserIdsAfterOpenSet: currentSet });
    },
    generalChatsWithUser: new Map<number, Set<number>>(),
    addGeneralChatsWithUser: (userId: number, chatId: number) => {
        const currentMap = new Map(get().generalChatsWithUser);
        const chatSet = currentMap.get(userId) ?? new Set<number>();
        chatSet.add(chatId);
        currentMap.set(userId, chatSet);
        set({ generalChatsWithUser: currentMap });
    },
    deleteGeneralChatsWithUser: (userId: number, chatId: number) => {
        const currentMap = new Map(get().generalChatsWithUser);
        const chatSet = currentMap.get(userId);
        if (chatSet) {
            chatSet.delete(chatId);
            if (chatSet.size === 0) {
                currentMap.delete(userId);
            }
        }
        set({ generalChatsWithUser: currentMap });
    },
    requiredUserUpdateMap: new Map<number, boolean>(),
    setRequiredUserUpdate: (userId: number, reqired: boolean) => {
        const currentMap = new Map(get().requiredUserUpdateMap);
        currentMap.set(userId, reqired);
        set({ requiredUserUpdateMap: currentMap });
    },
    // lastCheckUserVersionMap: new Map(),
    // setLastCheckUserVersion: (userId: number, instant = Date.now()) => {
    //     set((state) => {
    //         const map = new Map(state.lastCheckUserVersionMap);
    //         map.set(userId, instant);
    //         return { lastCheckUserVersionMap: map };
    //     });
    // }
}));
