import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { chatMembersDb } from "../internal/db/chatMembersCacheDatabase";
import type { ChatMembers, MemberFields } from "../models/chatMembers";
import { getMembers } from "../utils/ChatUtils";



export function useChatMembers(chatId: number) { //, permissibleTimeDeviationMs?: number
    const [members, setMembers] = useState<Map<number, MemberFields> | "not found" | "start state">("start state");
    const membersFromDb: ChatMembers | undefined | "start state" = useLiveQuery(() => {
        if (!chatId) return undefined;
        return chatMembersDb.chatMembers.get(chatId);
    }, [chatId], "start state");

    useEffect(() => {
        getMembers(chatId).then((memberMap) => {
            if (memberMap) {
                setMembers(memberMap);
            } else {
                setMembers("not found");
            }
            console.log("useChatMembers: обновлены участники чата " + chatId + " из сервера: " + (memberMap ? Array.from(memberMap.keys()).join(", ") : "not found"));
        });
    }, [chatId]);

    useEffect(() => {
        if (membersFromDb && membersFromDb !== "start state" && membersFromDb.members) {
            setMembers(membersFromDb.members.value);
            console.log("useChatMembers: обновлены участники чата " + chatId + " из бд: " + Array.from(membersFromDb.members.value.keys()).join(", "));
        }
    }, [membersFromDb]);

    return members;
}