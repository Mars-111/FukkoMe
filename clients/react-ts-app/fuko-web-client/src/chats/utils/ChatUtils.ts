import { useIdentityStroe } from "../../auth/hooks/useIdentity";
import { useUserCacheMetaStore } from "../../users/hooks/useUserCacheMetaStore";
import { useChatCacheMetaStore } from "../hooks/useChatCacheMetaStore";
import { createChatRequest, exitChatRequest, getChatByIdRequest, getChatsByLikeNameRequest, getChatsByLikeTagRequest, getChatVersionByIdRequest, getMembersRequest, getMyChatsRequest, joinToChatRequest, updateChatRequest, updateMyChatAvatarRequest, type CreateChatRequestBody, type UpdateMyChatAvatarBodyInterface, type UpdateMyChatBodyInterface } from "../internal/api/chatsApi";
import { chatDb } from "../internal/db/chatCacheDatabase";
import { chatMembersDb } from "../internal/db/chatMembersCacheDatabase";
import type { Chat } from "../models/chat";
import type { ChatMembers, MemberFields } from "../models/chatMembers";
import { makeChatRolesOutdatedByChatId } from "./ChatRoleUtils";



export function chatIsActual(chatId: number): boolean {
    const stateMetaCache = useChatCacheMetaStore.getState();
    if (!stateMetaCache.syncChatIdsAfterOpenSet.has(chatId)) {
        console.log("Первичной синхранизации нету => не актульный чат.")
        return false;
    }

    if (stateMetaCache.requiredChatUpdateMap.has(chatId)) {
        console.log("Требуеться обновлеие чата");
        return false;
    }

    if (!stateMetaCache.myChatIds.has(chatId)) {
        console.log("Чат не в моих чатах => не актульный чат.")
        return false;
    }

    return true;
}

export async function getChatVersionById(chatId: number) {
    return getChatVersionByIdRequest(chatId);
}

export async function syncChatId(chatId: number) {
    let chat = await chatDb.chats.get(chatId);
    if (!chat) {
        chat = await getChatByIdRequest(chatId);
    }
    else {
        const actualVersion = await getChatVersionById(chatId);
        if (chat.version !== actualVersion) {
            chat = await getChatByIdRequest(chatId);
        }
    }
    if (!chat) {
        console.error("Чат не был получен с сервера при синхронизации. id: ", chatId);
        return;
    }
    chatDb.chats.put(chat, chatId).then(() => {
        useChatCacheMetaStore.getState().addSyncChatIdsAfterOpen(chatId);
    });
}

export async function getChatAndSyncIfNeeded(chatId: number): Promise<Chat | null> {
    const chatFromDb: Chat | undefined = await chatDb.chats.get(chatId);
    if (!chatFromDb || !chatIsActual(chatId)) {
        console.log("Чата нету в кэше при получении по id, синхронизируем: ", chatId);
        await syncChatId(chatId);
        return await chatDb.chats.get(chatId) || null;
    }
    return chatFromDb;
}

async function saveChat(chat: Chat): Promise<void> {
    return chatDb.chats.put(chat, chat.id).then(() => {
        useChatCacheMetaStore.getState().addSyncChatIdsAfterOpen(chat.id);
    });
}

async function saveChats(chats: Chat[]): Promise<void> {
    return new Promise(() => {
        for (const chat of chats) {
            saveChat(chat);
        }
    });
}

export async function getMyChats(accessToken: string): Promise<Chat[]> {
    return await getMyChatsRequest(accessToken).then((chats: Chat[]) => {
        saveChats(chats);
        useChatCacheMetaStore.getState().setMyChatIds(new Set(chats.map(c => c.id)));
        return chats;
    });
}

export async function getChatsByLikeTag(tag: string, limit: number): Promise<Chat[]> {
    return await getChatsByLikeTagRequest(tag, limit).then((chats: Chat[]) => {
        saveChats(chats);
        return chats;
    });
}

export async function getChatsByLikeName(name: string, limit: number): Promise<Chat[]> {
    return await getChatsByLikeNameRequest(name, limit).then((chats: Chat[]) => {
        saveChats(chats);
        return chats;
    });
}

export async function createChat(data: CreateChatRequestBody, authToken: string): Promise<Chat> {
    return await createChatRequest(data, authToken).then((chat: Chat) => {
        saveChat(chat).then(() => {
            useChatCacheMetaStore.getState().addMyChatId(chat.id);
        });
        return chat;
    });
}

export function updateChat(chatId: number, updateChatBody: UpdateMyChatBodyInterface, authToken: string): Promise<Chat> {
    return updateChatRequest(chatId, updateChatBody, authToken).then((chat: Chat) => {
        saveChat(chat);
        return chat;
    });
}

export function updateChatAvatar(chatId: number, updateAvatarBody: UpdateMyChatAvatarBodyInterface, authToken: string): Promise<Chat> {
    return updateMyChatAvatarRequest(chatId, updateAvatarBody, authToken).then((chat: Chat) => {
        saveChat(chat);
        return chat;
    });
}


export async function getMembers(chatId: number): Promise<Map<number, MemberFields> | null> {
    let chatMembers: ChatMembers | undefined = await chatMembersDb.chatMembers.get(chatId);

    const hasChatInMyChats = useChatCacheMetaStore.getState().myChatIds.has(chatId);

    if (chatMembers && chatMembers.members && chatMembers.members.syncAfterJoiningChat && hasChatInMyChats) {
        return chatMembers.members.value;
    }

    return getMembersRequest(chatId)
        .then((memberIdToRoleIdMap) => {
            if (!memberIdToRoleIdMap) return null;
            const syncAfterJoiningChat = hasChatInMyChats;
            const lastSync = Date.now();
            const memberFieldsMap = new Map<number, MemberFields>(
                Array.from(memberIdToRoleIdMap.entries()).map(([userId, roleId]) => [
                    userId,
                    { roleId },
                ])
            );
            chatMembers = {...(chatMembers || {}), chatId, members: {syncAfterJoiningChat: syncAfterJoiningChat, value: memberFieldsMap, lastSync: lastSync} };
            chatMembersDb.chatMembers.put(chatMembers, chatId);
            if (!hasChatInMyChats) {
                for (const i of memberFieldsMap) { //i[0] - userId
                    useUserCacheMetaStore.getState().addGeneralChatsWithUser(i[0], chatId); 
                }
            }
            return memberFieldsMap;
        })
    .catch((error) => {
        console.log("Ошибка при получении количества участников чата " + chatId + ": " + error);
        return null;
    });
}


export async function joinToChat(chatId: number, authToken: string): Promise<boolean> {
    if (useChatCacheMetaStore.getState().myChatIds.has(chatId)) {
        return Promise.resolve(false);
    }

    return joinToChatRequest(chatId, authToken).then(() => {
        useChatCacheMetaStore.getState().addMyChatId(chatId);
        return true;
    }).catch(() => false);
}


export async function exitChat(chatId: number, authToken: string): Promise<boolean> {
    if (!useChatCacheMetaStore.getState().myChatIds.has(chatId)) {
        return Promise.resolve(false);
    }

    return exitChatRequest(chatId, authToken).then(() => {
        handleUsersLeaveFromChat(useIdentityStroe.getState().myUserId!, chatId);
        return true;
    }).catch(() => false);
}

export async function addMemberToChatMembersCache(chatId: number, userId: number, roleId: number) {
    console.log("Щя будем добавлять пользователя " + userId + " в кэш участников чата " + chatId);
    await chatMembersDb.transaction('rw', chatMembersDb.chatMembers, async () => {
        let chatMembers = await chatMembersDb.chatMembers.get(chatId);

        if (!chatMembers) {
            chatMembers = { chatId };
        }

        const membersMap =
            chatMembers.members?.value ?? new Map<number, MemberFields>();

        membersMap.set(userId, { roleId });

        chatMembers.members = {
            value: membersMap,
            syncAfterJoiningChat:
            chatMembers.members?.syncAfterJoiningChat ?? false,
            lastSync: chatMembers.members?.lastSync,
        };

        await chatMembersDb.chatMembers.put(chatMembers, chatId);

        if (userId === useIdentityStroe.getState().myUserId) {
            useChatCacheMetaStore.getState().addMyChatId(chatId);
        }

        useUserCacheMetaStore.getState().addGeneralChatsWithUser(userId, chatId);
        console.log("Добавлен пользователь " + userId + " в кэш участников чата " + chatId);
    });
}

export async function removeMemberFromChatMembersCache(chatId: number, userId: number) {
    console.log("Удален пользователььь asdasdasdas");
    await chatMembersDb.transaction('rw', chatMembersDb.chatMembers, async () => {
        let chatMembers = await chatMembersDb.chatMembers.get(chatId);

        console.log("Получены участники чата для удаления: ", chatMembers);
        if (!chatMembers || !chatMembers.members || !chatMembers.members.value.has(userId)) {
            console.log(`Пользователей в чате и так нет, удалять нечего (ВЕРОЯТНО ОШИБКА, ТК МЫ ПО ИДЕЕ МЫ ЛИШНИЙ РАЗ, КОГДА ЧАТ ПУСТОЙ УДАЛЯТЬ НЕ БУДЕМ) - userId: ${userId}, chatId: ${chatId}`);
            return;
        }

        const membersMap = new Map(chatMembers.members.value);

        membersMap.delete(userId);

        chatMembers.members = {
            value: membersMap,
            syncAfterJoiningChat: chatMembers.members?.syncAfterJoiningChat ?? false,
            lastSync: chatMembers.members?.lastSync,
        };

        if (userId === useIdentityStroe.getState().myUserId) {
            useChatCacheMetaStore.getState().deleteMyChatId(chatId);
            chatMembers.members.syncAfterJoiningChat = false;
        }

        await chatMembersDb.chatMembers.put(chatMembers, chatId);


        useUserCacheMetaStore.getState().deleteGeneralChatsWithUser(userId, chatId);
        console.log("Удален пользователььь " + userId + " из кэша участников чата " + chatId);
    });
}

export function handleUsersLeaveFromChat(userId: number, chatId: number) {
    if (userId === undefined || chatId === undefined) {
        console.error("Received empty leave from chat data");
        return;
    }
    console.log("handleLeaveFromChat: пользователь " + userId + " покидает чат " + chatId);
    removeMemberFromChatMembersCache(chatId, userId);
    if (userId === useIdentityStroe.getState().myUserId) {
        makeChatRolesOutdatedByChatId(chatId);
        if (userId === useIdentityStroe.getState().myUserId) {
            useChatCacheMetaStore.getState().deleteMyChatId(chatId);
        }
    }
}

export function handleUsersJoinToChat(userId: number, chatId: number) {
    if (userId === undefined || chatId === undefined) {
        console.error("Received empty join to chat data");
        return;
    }
    getChatAndSyncIfNeeded(chatId).then((chat) => {
        if (!chat) {
            console.error("Чат не был получен с сервера при обработке события JOIN. id: ", chatId);
            return;
        }
        addMemberToChatMembersCache(chatId, userId, chat.defaultRoleId);
    });
}

export function handleEditChatEvent(chatId: number) {
    useChatCacheMetaStore.getState().setRequiredChatUpdate(chatId, true);
}