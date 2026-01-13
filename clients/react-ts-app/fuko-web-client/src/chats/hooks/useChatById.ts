import { useEffect, useState } from "react";
import type { Chat } from "../models/chat";
import { getChatAndSyncIfNeeded } from "../utils/ChatUtils";
import { useLiveQuery } from "dexie-react-hooks";
import { chatDb } from "../internal/db/chatCacheDatabase";
import { useChatCacheMetaStore } from "./useChatCacheMetaStore";


export function useChatById(chatId: number): Chat | null | undefined {
    const [chat, setChat] = useState<Chat | null | undefined>(undefined);
    const chatFromDb: Chat | undefined = useLiveQuery(() => {
        if (!chatId) return undefined;
        return chatDb.chats.get(chatId);
    }, [chatId]);

    const requiredUpdateMap = useChatCacheMetaStore((state) => state.requiredChatUpdateMap);

    useEffect(() => {
        getChatAndSyncIfNeeded(chatId).then((newChat) => {
            if (!newChat) {
                setChat(null);
                return;
            }
            setChat(newChat);
        });
    }, [requiredUpdateMap]);

    useEffect(() => {
        if (chatFromDb) {
            if (chat?.version && chatFromDb.version > chat?.version) {
                setChat(chatFromDb);
            }
        }
    }, [chatFromDb]);


    return chat;
}