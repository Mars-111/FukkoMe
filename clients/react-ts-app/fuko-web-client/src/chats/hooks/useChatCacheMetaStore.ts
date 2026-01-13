import { create } from "zustand";

export type StateChat = {
    /*
        Список id чатов, которых мы уже синхронизировали после входа.
        Если нету в списке - необходимо сверить версии с бекендом и при необхлдимости обновить пользователя.
    */
    syncChatIdsAfterOpenSet: Set<number>;
    addSyncChatIdsAfterOpen: (chatId: number) => void;
    /*
        Нужно требуеться ли обновление?
        Эти boolean говорят нам, нужно ли обнолять пользоватея, если он актуален?
    */
    requiredChatUpdateMap: Map<number, boolean>;
    setRequiredChatUpdate: (chatId: number, required: boolean) => void;
    /*
        Список моих чатов, что бы не запрашивать их каждый раз.
    */
    myChatIds: Set<number>;
    setMyChatIds: (chatIds: Set<number>) => void;
    addMyChatId: (chatId: number) => void;
    deleteMyChatId: (chatId: number) => void;
};

export const useChatCacheMetaStore = create<StateChat>((set, get) => ({
    syncChatIdsAfterOpenSet: new Set<number>(),
    addSyncChatIdsAfterOpen: (chatId: number) => {
        const currentSet = new Set(get().syncChatIdsAfterOpenSet);
        currentSet.add(chatId);
        set({ syncChatIdsAfterOpenSet: currentSet });
    },
    requiredChatUpdateMap: new Map<number, boolean>(),
    setRequiredChatUpdate: (chatId: number, required: boolean) => {
        const currentMap = new Map(get().requiredChatUpdateMap);
        currentMap.set(chatId, required);
        set({ requiredChatUpdateMap: currentMap });
    },
    myChatIds: new Set<number>(),
    setMyChatIds: (chatIds: Set<number>) => {
        set({ myChatIds: chatIds });
    },
    addMyChatId: (chatId: number) => {
        set((state) => { 
            const newMyChatIds = new Set(state.myChatIds);
            newMyChatIds.add(chatId)
            return { myChatIds: newMyChatIds};
        });
    },
    deleteMyChatId: (chatId: number) => {
        set((state) => { 
            const newMyChatIds = new Set(state.myChatIds);
            newMyChatIds.delete(chatId)
            return { myChatIds: newMyChatIds};
        });
    }
}));
