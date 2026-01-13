import Dexie from "dexie";
import type { Table } from "dexie";
import type { ChatRole } from "../../models/chatRole";
import type { UserChatRoleMapping } from "../../models/userChatRoleMapping";


export class ChatRoleCacheDatabase extends Dexie {
    chatRoles!: Table<ChatRole, number>;
    userChatRoleMapping!: Table<UserChatRoleMapping, number>;

    constructor() {
        super("ChatRoleCache");
        this.version(1).stores({
            chatRoles: "id",
            userChatRoleMapping: "[chatId+userId], roleId"
        });
    }
}

export const chatRolesDb = new ChatRoleCacheDatabase();