import { hasSubscribe } from "../../socket/useSocketUtil";
import { useChatCacheMetaStore } from "../hooks/useChatCacheMetaStore";
import { getChatByIdRequest, getChatByLikeNameRequest, getChatByLikeTagRequest, getMyChatIdsRequest, getMyChatsRequest } from "../internal/api/chatsApi";
import { chatDb } from "../internal/db/chatCacheDatabase";
import type { Chat } from "../models/chat";



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

    if (hasSubscribe("c:" + chatId)) {
        return true;
    }

    return true;
}

export async function syncChatId(chatId: number) {
    const newChat: Chat = await getChatByIdRequest(chatId);
    if (!newChat) {
        console.error("Чат не был получен с сервера при синхронизации. id: ", chatId);
        return;
    }
    chatDb.chats.put(newChat, newChat.id); 
}

export async function getChatIdAndSyncIfNeeded(chatId: number): Promise<Chat | null> {
    const chatFromDb: Chat | undefined = await chatDb.chats.get(chatId);
    if (!chatFromDb || !chatIsActual(chatId)) {
        console.log("Чата нету в кэше при получении по id, синхронизируем: ", chatId);
        await syncChatId(chatId);
        return await chatDb.chats.get(chatId) || null;
    }
    return chatFromDb;
}

function saveChats(chats: Chat[]) {
    for (const chat of chats) {
        chatDb.chats.put(chat, chat.id);
    }
}

export async function getMyChatIds(accessToken: string): Promise<number[]> {
    return await getMyChatIdsRequest(accessToken).then((chatIds: number[]) => {
        //TODO: По идее надо сохранить наши чаты где-то, что бы лишние разы не запрашивать
        return chatIds;
    });
}

export async function getChatByLikeTag(tag: string, limit: number): Promise<Chat[]> {
    return await getChatByLikeTagRequest(tag, limit).then((chats: Chat[]) => {
        saveChats(chats);
        return chats;
    });
}

export async function getChatByLikeName(name: string, limit: number): Promise<Chat[]> {
    return await getChatByLikeNameRequest(name, limit).then((chats: Chat[]) => {
        saveChats(chats);
        return chats;
    });
}