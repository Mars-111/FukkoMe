import { handleEditChatEvent, handleUsersJoinToChat, handleUsersLeaveFromChat } from "../chats/utils/ChatUtils";
import { objectToChatEvent, type ChatEvent } from "./chatEvent";
import { getChatEventsRequest } from "./chatEventApi";

const LAST_EVENT_TIMELINE_ID_KEY = "chat:lastTimelineIds";
//нам не нужно считать пропущенные события, тк мы получаем их в виде списка и если их нет, то их и не будет (например 1, 2, 4, 5 - значит 3 нет и не будет)


function loadLastEventTimelineIdMap(): Record<number, number> {
    const raw = localStorage.getItem(LAST_EVENT_TIMELINE_ID_KEY);
    return raw ? JSON.parse(raw) : {};
}

function saveLastEventTimelineIdMap(map: Record<number, number>) {
    localStorage.setItem(LAST_EVENT_TIMELINE_ID_KEY, JSON.stringify(map));
}

export function setLastEventTimelineId(chatId: number, timelineId: number): void {
    const map = loadLastEventTimelineIdMap();
    const prev = map[chatId];

    // защита от отката назад
    if (prev !== undefined && timelineId <= prev) return;

    map[chatId] = timelineId;
    saveLastEventTimelineIdMap(map);
}

export function getLastTimelineId(chatId: number): number | null {
    const map = loadLastEventTimelineIdMap();
    return map[chatId] ?? null;
}

export async function getChatEvents(chatId: number, afterTimelineId?: number, limit?: number): Promise<ChatEvent[] | null> {
    const chatEvents  = await getChatEventsRequest(chatId, afterTimelineId, limit);

    if (!chatEvents) {
        return null;
    }

    chatEvents.sort((a, b) => a.timelineId - b.timelineId);
    
    console.log("Получили события чата: ", chatEvents);

    for (const event of chatEvents) {
        executeChatEvent(event).catch(console.error);
    }
    
    return chatEvents;
}

export async function syncChatEventsByMyChats(myChatsIds: number[]): Promise<void> {
    //Получаем мои чаты => ищем последний timelineId в кэше (если нет, то с начала) => получаем новые события с сервера
    for (const chatId of myChatsIds) {
        const lastTimelineId = getLastTimelineId(chatId) ?? undefined;
        await getChatEvents(chatId, lastTimelineId);
    }
}


export async function executeChatEvent(event: ChatEvent): Promise<void> {
    event = objectToChatEvent(event, ["timelineId", "chatId", "type"]);
    switch (event.type) {
        case "DELETE_MESSAGE":
            console.log("Обработка события DELETE_MESSAGE");
            setLastEventTimelineId(event.chatId, event.timelineId);
            break;
        case "EDIT_MESSAGE":
            console.log("Обработка события EDIT_MESSAGE");
            setLastEventTimelineId(event.chatId, event.timelineId);
            break;
        case "JOIN":
            console.log("Обработка события JOIN");
            var chatId = event.chatId;
            var userId = event.data?.userId;
            handleUsersJoinToChat(userId, chatId);
            console.log(`Пользователь с ID ${userId} присоединился к чату с ID ${chatId}`);
            setLastEventTimelineId(event.chatId, event.timelineId);
            break;
        case "LEAVE":
            console.log("Обработка события LEAVE");
            var chatId = event.chatId;
            var userId = event.data?.userId;
            console.log(`Пользователь с ID ${userId} покинул чат с ID ${chatId}`);
            handleUsersLeaveFromChat(userId, chatId);
            setLastEventTimelineId(event.chatId, event.timelineId);
            break;
        case "BAN":
            console.log("Обработка события BAN");
            setLastEventTimelineId(event.chatId, event.timelineId);
            break;
        case "MUTE":
            console.log("Обработка события MUTE");
            setLastEventTimelineId(event.chatId, event.timelineId);
            break;
        case "EDIT_CHAT":
            console.log("Обработка события EDIT_CHAT");
            var chatId: number = event.chatId;
            handleEditChatEvent(chatId);
            setLastEventTimelineId(event.chatId, event.timelineId);
            break;
        default:
            console.warn(`Обработка события (неизвестное): ${event.type}`);
    }
}

// function handleJoinToChat(userId: number, chatId: number) {
//     if (userId === undefined || chatId === undefined) {
//         console.error("Received empty join to chat data");
//         return;
//     }
//     getChatAndSyncIfNeeded(chatId).then((chat) => {
//         if (!chat) {
//             console.error("Чат не был получен с сервера при обработке события JOIN. id: ", chatId);
//             return;
//         }
//         addMemberToChatMembersCache(userId, chatId, chat.defaultRoleId);
//     });
// }

// function handleLeaveFromChat(userId: number, chatId: number) {
//     if (userId === undefined || chatId === undefined) {
//         console.error("Received empty leave from chat data");
//         return;
//     }
//     removeMemberFromChatMembersCache(userId, chatId);
//     if (userId === useIdentityStroe.getState().myUserId) {
//         makeChatRolesOutdated(chatId);
//     }
// }