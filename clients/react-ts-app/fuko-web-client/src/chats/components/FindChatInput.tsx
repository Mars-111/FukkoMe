import { useEffect, useState } from "react";
import type { Chat } from "../models/chat";
import { getChatsByLikeName, getChatsByLikeTag } from "../utils/ChatUtils";
import "./FindChatInput.css";
import { useSearchParams } from "react-router-dom";


export function FindChatAndUsersInput({ setRequest, setResult }: { setRequest?: (req: string) => void; setResult?: (res: Chat[]) => void; }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialValue = searchParams.get("chat-find") ?? "";
    const [value, setValue] = useState(initialValue);

    // обновляем URL при изменении value
    useEffect(() => {
        if (value.trim().length === 0) {
            searchParams.delete("chat-find");
            setSearchParams(searchParams);
        } else {
            setSearchParams({ "chat-find": value });
        }
    }, [value]);

    // основной поиск
    useEffect(() => {
        setRequest?.(value);

        if (value.trim().length === 0) {
            setResult?.([]);
            return;
        }

        const timeout = setTimeout(async () => {
            const [byTag, byName] = await Promise.all([
                getChatsByLikeTag(value, 20),
                getChatsByLikeName(value, 20)
            ]);

            const merged: Chat[] = [...byTag];
            for (const c of byName) {
                if (!merged.some(m => m.id === c.id)) merged.push(c);
            }

            setResult?.(merged);
        }, 250);

        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <div className="find-chat-container">
            <span className="find-chat-icon">🔍</span>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="find-chat-input"
                placeholder="Поиск по чатам"
            />
        </div>
    );
}
