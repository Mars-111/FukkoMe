import Dexie, { type Table } from "dexie";

export type EntityType = "user" | "chat";

export interface RecentEntity {
    idInRecentDb?: number;         // ID записи в БД
    entityId: number;         // ID пользователя или чата
    type: EntityType;   // "u" - user, "c" - chat
}

export class CacheRecentEntityDb extends Dexie {
    recentEntities!: Table<RecentEntity, number>; 
    // составной ключ: [id, type]

    constructor() {
        super("CacheRecentEntityDb");
        this.version(1).stores({
            recentEntities: "++idInRecentDb, entityId, type"
        });
    }
}

export const cacheRecentEntityDb = new CacheRecentEntityDb();
