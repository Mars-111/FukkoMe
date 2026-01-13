

export type ChatRole = {
    id: number;
    chatId: number;
    name: string;
    version: number;
    rank: number;
    accessFlags: number;
    syncAfterJoinToChat?: boolean;
};


export function objectToChatRole(obj: any): ChatRole {
    if (!obj) {
        throw new Error("objectToChatRole: input is null or undefined");
    }

    const id = obj.id;
    const chatId = obj.chat_id ?? obj.chatId;
    const name = obj.name;
    const version = obj.version;
    const rank = obj.rank;
    const accessFlags = obj.accessFlags ?? obj.access_flags;

    if (id === undefined) throw new Error("Missing required field 'id'");
    if (chatId === undefined) throw new Error("Missing required field 'chatId'");
    if (name === undefined) throw new Error("Missing required field 'name'");
    if (version === undefined) throw new Error("Missing required field 'version'");
    if (rank === undefined) throw new Error("Missing required field 'rank'");
    if (accessFlags === undefined) throw new Error("Missing required field 'accessFlags'");

    return {
        id,
        chatId,
        name,
        version,
        rank,
        accessFlags
    };
}
