import Dexie from "dexie";
import type { Table } from "dexie";
import type { ChatMembers } from "../../models/chatMembers";


export class ChatMembersCacheDatabase extends Dexie {
    chatMembers!: Table<ChatMembers, number>;

    constructor() {
        super("ChatMembersCache");
        this.version(1).stores({
            chatMembers: "chatId"
        });
    }
}

export const chatMembersDb = new ChatMembersCacheDatabase();