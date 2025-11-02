import Dexie from "dexie";
import type { Table } from "dexie";
import type { Chat } from "../../models/chat";

export class ChatCacheDatabase extends Dexie {
    chats!: Table<Chat, number>;

    constructor() {
        super("ChatCache");
        this.version(1).stores({
            chats: "id"
        });
    }
}

export const chatDb = new ChatCacheDatabase();