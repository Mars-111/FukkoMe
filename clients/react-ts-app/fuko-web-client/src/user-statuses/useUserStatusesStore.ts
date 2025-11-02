import { create } from "zustand";
import type { UserStatus } from "./status";




export type UserStatusesType = {
    userStatuses: Map<number, { onlineSessions: Set<string>, lastSeen: number | null | undefined }>;
    startStatusFetched: Set<number>;
    addOnlineSession: (userId: number, sessionId: string) => void;
    setOnlineSessions: (userId: number, sessionsIds: Set<string>) => void;
    removeOnlineSession: (userId: number, sessionId: string) => void;
    isOnline: (userId: number) => boolean;
    getLastSeen: (userId: number) => number | null | undefined;
    getUserStatus: (userId: number) => UserStatus | null;
    setStartStatusFetched: (userId: number, fetched: boolean) => void;
    startStatusIsFetched: (userId: number) => boolean;
    setLastSeen: (userId: number, lastSeen: number | null | undefined) => void;
};



export const useUserStatusesStore = create<UserStatusesType>((set, get) => ({
    userStatuses: new Map(),
    startStatusFetched: new Set<number>(),
    addOnlineSession: (userId: number, sessionId: string) => {
        set((state) => {
            let newUserStatuses = new Map(state.userStatuses);
            if (!newUserStatuses) {
                console.error("No userStatuses map in state!");
                newUserStatuses = new Map();
            }
            if (!newUserStatuses.has(userId)) {
                newUserStatuses.set(userId, { onlineSessions: new Set<string>(), lastSeen: null });
            }
            else if (!newUserStatuses.get(userId)?.onlineSessions) {
                newUserStatuses.set(userId, { onlineSessions: new Set<string>(), lastSeen: newUserStatuses.get(userId)!.lastSeen });
            }
            newUserStatuses.get(userId)!.onlineSessions.add(sessionId);

            console.log("Добавляем сессию: " + sessionId);
            return { userStatuses: newUserStatuses };
        });
    },
    setOnlineSessions: (userId: number, sessionsIds: Set<string>) => {
        set((state) => {
            let newUserStatuses = new Map(state.userStatuses);
            if (!newUserStatuses) {
                console.error("No userStatuses map in state!");
                newUserStatuses = new Map();
            }
            newUserStatuses.set(userId, { onlineSessions: sessionsIds, lastSeen: newUserStatuses.get(userId)?.lastSeen || undefined });

            return { userStatuses: newUserStatuses };
        });
    },
    removeOnlineSession: (userId: number, sessionId: string) => {
        console.log("Remove online session start");
        set((state) => {
            let newUserStatuses = new Map(state.userStatuses);
            if (!newUserStatuses) {
                console.error("No userStatuses map in state!");
                newUserStatuses = new Map<number, { onlineSessions: Set<string>, lastSeen: number | null | undefined}>();
            }
            if (!newUserStatuses.has(userId) || !newUserStatuses.get(userId)!.onlineSessions) {
                return {};
            }
            
            newUserStatuses.get(userId)!.onlineSessions.delete(sessionId);

            return { userStatuses: newUserStatuses };
        });
    },
    isOnline: (userId: number) => {
        const userStatus = get().userStatuses.get(userId);
        return !!userStatus && userStatus.onlineSessions.size > 0;
    },
    getLastSeen: (userId: number): number | null | undefined => {
        const userStatus = get().userStatuses.get(userId);
        return userStatus ? userStatus.lastSeen : null;
    },
    getUserStatus: (userId: number): UserStatus => {
        const online: boolean = get().isOnline(userId);
        const lastSeen: number | null | undefined = get().getLastSeen(userId);
        return {online: online, lastSeen: lastSeen};
    },
    setStartStatusFetched: (userId: number, fetched: boolean) => {
        const newStartStatusFetched = new Set(get().startStatusFetched);

        if (fetched)
            newStartStatusFetched.add(userId);
        else 
            newStartStatusFetched.delete(userId);

        set({ startStatusFetched: newStartStatusFetched });
    },
    startStatusIsFetched: (userId: number): boolean => {
        return get().startStatusFetched.has(userId);
    },
    setLastSeen: (userId: number, lastSeen: number | null | undefined): void => {
        const newUserStatuses = new Map(get().userStatuses);
        let userStatus = newUserStatuses.get(userId);
        if (!userStatus) {
            userStatus = { onlineSessions: new Set(), lastSeen: lastSeen };
        }
        userStatus.lastSeen = lastSeen;
        newUserStatuses.set(userId, userStatus);
        return set({ userStatuses: newUserStatuses });
    }
}));

