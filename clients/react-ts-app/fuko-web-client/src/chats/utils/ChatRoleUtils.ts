import { useChatCacheMetaStore } from "../hooks/useChatCacheMetaStore";
import { getRoleByIdRequest, getRoleVersionByIdReauest } from "../internal/api/chatRolesApi";
import { chatRolesDb } from "../internal/db/chatRoleCacheDatabase";
import type { ChatRole } from "../models/chatRole";

export function chatRoleIsActual(chatRole: ChatRole) {
    return chatRole?.syncAfterJoinToChat === true && useChatCacheMetaStore.getState().myChatIds.has(chatRole.chatId);
}

export async function getRoleById(roleId: number): Promise<ChatRole> {
    const chatRole = await chatRolesDb.chatRoles.get(roleId);
    if (chatRole && chatRoleIsActual(chatRole)) {
        return chatRole;
    }
    return getRoleByIdRequest(roleId).then((chatRole) => {
        const myChatIds = useChatCacheMetaStore.getState().myChatIds;
        if (myChatIds.has(chatRole.chatId)) {
            chatRole.syncAfterJoinToChat = true;
        }
        chatRolesDb.chatRoles.put(chatRole, chatRole.id);
        return chatRole;
    });
}

export async function syncRoleIfVersionOutdated(roleId: number) {
    const chatRole = await chatRolesDb.chatRoles.get(roleId);
    const actualVersion: number | null = !chatRole ? null : await getRoleVersionByIdReauest(chatRole.id);
    if (!actualVersion || !chatRole || actualVersion > chatRole.version) {
        await getRoleById(roleId);
    } else if (!chatRole.syncAfterJoinToChat) {
        const myChatIds = useChatCacheMetaStore.getState().myChatIds;
        if (myChatIds.has(chatRole.chatId)) {
            chatRole.syncAfterJoinToChat = true;
        }
        chatRolesDb.chatRoles.put(chatRole, chatRole.id);
    }
}

export function makeChatRolesOutdatedByChatId(chatId: number) {
    chatRolesDb.chatRoles.where("chatId").equals(chatId).modify((chatRole) => {
        chatRole.syncAfterJoinToChat = false;
    });
}