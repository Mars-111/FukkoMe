import type { FileMessageMetadata } from "./fileMessageMetadata";



export type Message = {
    id: number;
    timelineId: number;
    flags: number;
    chatId: number;
    senderId: number;
    content: string;
    replyToId?: number;
    forwardedFromId?: number;
    fileList: FileMessageMetadata[];
    timestamp: number;
};