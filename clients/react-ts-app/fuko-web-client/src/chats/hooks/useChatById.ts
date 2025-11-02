import { useEffect, useState } from "react";
import type { Chat } from "../models/chat";
import { getChatIdAndSyncIfNeeded } from "../utils/ChatUtils";
import { useLiveQuery } from "dexie-react-hooks";
import { chatDb } from "../internal/db/chatCacheDatabase";


export function useChatById(chatId: number) {
    const [chat, setChat] = useState<Chat | null | undefined>(undefined);
    const chatFromDb: Chat | undefined = useLiveQuery(() => {
        if (!chatId) return undefined;
        return chatDb.chats.get(chatId);
    }, [chatId]);


    useEffect(() => {
        getChatIdAndSyncIfNeeded(chatId).then((newChat) => {
            if (!newChat) {
                setChat(null);
                return;
            }
            if (chat?.version && chat?.version > newChat.version) {
                return;
            }
            setChat(newChat);
        });
    }, [chatId]);

    useEffect(() => {
        if (chatFromDb) {
            if (chat?.version && chat?.version > chatFromDb.version) {
                return;
            }
            setChat(chatFromDb);
        }
    }, [chatFromDb]);


    return chat;
}