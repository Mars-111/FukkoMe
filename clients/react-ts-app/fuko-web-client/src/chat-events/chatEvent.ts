

export type ChatEventTypes = "DELETE_MESSAGE" | "EDIT_MESSAGE" | "JOIN" | "LEAVE" | "BAN" | "MUTE" | "EDIT_CHAT";

export type ChatEvent = {
    id: number;
    timelineId: number;
    chatId: number;
    type: ChatEventTypes;
    data?: any;
};

export type requiredFieldsForChatEvent =
    | "id"
    | "timelineId"
    | "chatId"
    | "type"
    | "data";


export function objectToChatEvent(
    obj: any,
    requiredFieldsForEvent: requiredFieldsForChatEvent[] = [
        "id",
        "timelineId",
        "chatId",
        "type",
        "data"
    ]
): ChatEvent {
    let event: ChatEvent = {} as ChatEvent;

    if (requiredFieldsForEvent.includes("id")) {
        const idFromObj: number = obj.id;
        if (idFromObj === undefined) {
            throw new Error("Missing required field 'id' in objectToEvent");
        }
        event.id = idFromObj;
    } else {
        event.id = obj.id;
    }

    if (requiredFieldsForEvent.includes("timelineId")) {
        const timelineIdFromObj: number = obj.timeline_id || obj.timelineId;
        if (timelineIdFromObj === undefined) {
            throw new Error("Missing required field 'timelineId' in objectToEvent");
        }
        event.timelineId = timelineIdFromObj;
    } else {
        event.timelineId = obj.timeline_id || obj.timelineId;
    }

    if (requiredFieldsForEvent.includes("chatId")) {
        const chatIdFromObj: number = obj.chat_id || obj.chatId;
        if (chatIdFromObj === undefined) {
            throw new Error("Missing required field 'chatId' in objectToEvent");
        }
        event.chatId = chatIdFromObj;
    } else {
        event.chatId = obj.chat_id || obj.chatId;
    }

    if (requiredFieldsForEvent.includes("type")) {
        const typeFromObj: ChatEventTypes = obj.type;
        if (typeFromObj === undefined) {
            throw new Error("Missing required field 'type' in objectToEvent");
        }
        event.type = typeFromObj;
    } else {
        event.type = obj.type;
    }

    if (requiredFieldsForEvent.includes("data")) {
        const dataFromObj: any = obj.data;
        if (dataFromObj === undefined) {
            throw new Error("Missing required field 'data' in objectToEvent");
        }
        event.data = dataFromObj;
    } else {
        event.data = obj.data;
    }

    return event;
}
