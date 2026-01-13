import { useEffect, useRef, useState } from "react";
import type { Chat } from "../models/chat";
import { useLiveQuery } from "dexie-react-hooks";
import { chatDb } from "../internal/db/chatCacheDatabase";
import { syncChatId } from "../utils/ChatUtils";


export function useChatByIdFromDb(chatId: number) {
    const isNotFirstSyncRef = useRef<boolean>(true);
    const [chat, setChat] = useState<Chat | "not found from db" | "finding">("finding");
    useLiveQuery(() => {
        if (!chatId) return;
        chatDb.chats.get(chatId).then((chatFromDb) => {
            if (!chatFromDb) {
                setChat("not found from db");
            }
            else {
                setChat(chatFromDb);
            }
        });
    }, [chatId]);

    useEffect(() => {
        if (chat === "not found from db" && isNotFirstSyncRef) {
            console.warn("Нужна синхронизация для чата " + chatId);
            syncChatId(chatId);
            isNotFirstSyncRef.current = false;
        }
    }, []);
    return chat;
}
