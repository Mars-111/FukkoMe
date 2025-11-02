import Dexie from "dexie";
import type { Table } from "dexie";
import type { ChatRole } from "../../models/chatRole";


export class ChatRoleCacheDatabase extends Dexie {
    chatRoles!: Table<ChatRole, number>;

    constructor() {
        super("ChatRoleCache");
        this.version(1).stores({
            chatRoles: "id"
        });
    }
}

export const chatRolesDb = new ChatRoleCacheDatabase();