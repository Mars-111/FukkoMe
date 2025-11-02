import { cacheRecentEntityDb, type EntityType, type RecentEntity } from "../internal/db/cacheRecentEntityDb";
import { useLiveQuery } from "dexie-react-hooks";
import { getRecentChats, getRecentEntities, getRecentUsers } from "./recentEntityUtils";

// 🔹 ХУКИ

export function useRecentEntities(limit: number = 20): RecentEntity[] | undefined {
    return useLiveQuery(() =>
                getRecentEntities(limit),
            [limit]
        );
}

export function useRecentUsers(limit: number = 20): RecentEntity[] | undefined {
    return useLiveQuery(() => 
            getRecentUsers(limit),
        [limit]
    );
}

export function useRecentChats(limit: number = 20): RecentEntity[] | undefined {
    return useLiveQuery(() => 
            getRecentChats(limit),
        [limit]
    );
}
