import Dexie from "dexie";
import type { Table } from "dexie";
import type { userChatRoleMapping } from "../../models/userChatRoleMapping";

export class UserChatRoleMappingCacheDatabase extends Dexie {
    userChatRoleMappings!: Table<userChatRoleMapping, [number, number]>;

    constructor() {
        super("ChatCache");
        this.version(1).stores({
            userChatRoleMappings: "[chatId+userId]"
        });
    }
}

export const userChatRoleMappingDb = new UserChatRoleMappingCacheDatabase();