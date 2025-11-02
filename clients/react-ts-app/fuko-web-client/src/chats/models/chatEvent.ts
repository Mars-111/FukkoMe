
export type ChatEventType = "DELETE_MESSAGE" | "EDIT_MESSAGE" | "JOIN" | "LEAVE" | "BAN" | "MUTE";

export type ChatEvent = {
    id: number;
    timelineId: number;
    type: ChatEventType;
    data: string;
    timestamp: number;
};