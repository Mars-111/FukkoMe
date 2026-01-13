import Dexie from "dexie";
import type { Table } from "dexie";
import type { Chat } from "../../models/chat";

export class ChatCacheDatabase extends Dexie {
    chats!: Table<Chat, number>;
    // myChatIds!: Table<number, number>; //Для быстрого отображения (каждый заход мы будем запрашивать и переопределять наши чаты)

    constructor() {
        super("ChatCache");
        this.version(1).stores({
            chats: "id",
            // myChatIds: "id" 
        });
    }
}

export const chatDb = new ChatCacheDatabase();