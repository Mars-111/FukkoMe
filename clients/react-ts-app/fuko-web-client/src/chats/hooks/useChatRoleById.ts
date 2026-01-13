import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { ChatRole } from "../models/chatRole";
import { chatRolesDb } from "../internal/db/chatRoleCacheDatabase";
import { getRoleById } from "../utils/ChatRoleUtils";


export function useChatRoleById(chatRoleId: number): ChatRole | "not found" | "start state" {
    const [chatRole, setChatRole] = useState<ChatRole | "not found" | "start state">("start state");
    const chatRoleFromDb: ChatRole | undefined | "start state" = useLiveQuery(() => {
        if (!chatRoleId) return undefined;
        return chatRolesDb.chatRoles.get(chatRoleId);
    }, [chatRoleId], "start state");

    //активируем обновления из бд
    useEffect(() => {
        let chatRoleFromDbState: ChatRole | undefined | "start state" = chatRoleFromDb;

        if (chatRoleFromDbState === "start state") return;
        if (chatRoleFromDbState === undefined) return;

        setChatRole(chatRoleFromDbState);
    }, [chatRoleFromDb]);

    useEffect(() => {
        getRoleById(chatRoleId).then((cr) => {
            setChatRole(cr);
        }).catch(() => {
            setChatRole("not found");
        });
    }, [chatRoleId]);

    return chatRole;
}