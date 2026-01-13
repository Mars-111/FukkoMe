
export type ChatType = "PRIVATE" | "PUBLIC_GROUP" | "PRIVATE_GROUP" | "PUBLIC_CHANNEL" | "PRIVATE_CHANNEL";

export type Chat = {
    id: number;
    version: number;
    tag: string;
    name: string;
    description: string;
    type: ChatType;    
    ownerId: number;
    defaultRoleId: number;
    smallAvatarId: number;
    largeAvatarId: number;
    fullscreenAvatarId: number;
    createdAt?: number;
};

export type requiredFieldsForChat = "id" | "version" | "tag" | "name" | "type" | "ownerId" | "defaultRoleId" | "description" | "createdAt" | "small_avatar_id" | "large_avatar_id" | "fullscreen_avatar_id";
export function objectToChat(
    obj: any, 
    requiredFieldsForChat: requiredFieldsForChat[] = ["id", "version", "tag", "name", "type", "ownerId", "description", "small_avatar_id", "large_avatar_id", "fullscreen_avatar_id"]
): Chat {
    let chat: Chat = {} as Chat;
    if (requiredFieldsForChat.includes("id")) {
        const idFromObj: number = obj.id;
        if (idFromObj === undefined) {
            throw new Error("Missing required field 'id' in objectToChat");
        }
        chat.id = idFromObj;
    }
    else {
        chat.id = obj.id;
    }

    if (requiredFieldsForChat.includes("version")) {
        const versionFromObj: number = obj.version;
        if (versionFromObj === undefined) { 
            throw new Error("Missing required field 'version' in objectToChat");
        }
        chat.version = versionFromObj;
    }
    else {
        chat.version = obj.version;
    }

    if (requiredFieldsForChat.includes("tag")) {
        const tagFromObj: string = obj.tag;
        if (tagFromObj === undefined) {
            throw new Error("Missing required field 'tag' in objectToChat");
        }
        chat.tag = tagFromObj;
    }
    else {
        chat.tag = obj.tag;
    }

    if (requiredFieldsForChat.includes("name")) {
        const nameFromObj: string = obj.name;
        if (nameFromObj === undefined) {
            throw new Error("Missing required field 'name' in objectToChat");
        }
        chat.name = nameFromObj;
    } else {
        chat.name = obj.name;
    }

    if (requiredFieldsForChat.includes("type")) {
        const typeFromObj: ChatType = obj.type;
        if (typeFromObj === undefined) {
            throw new Error("Missing required field 'type' in objectToChat");
        }
        chat.type = typeFromObj;
    }
    else {
        chat.type = obj.type;
    }

    if (requiredFieldsForChat.includes("ownerId")) {
        const ownerIdFromObj: number = obj.owner_id || obj.ownerId;
        if (ownerIdFromObj === undefined) {
            throw new Error("Missing required field 'ownerId' in objectToChat");
        }
        chat.ownerId = ownerIdFromObj;
    }
    else {
        chat.ownerId = obj.owner_id || obj.ownerId;
    }

    if (requiredFieldsForChat.includes("description")) {
        const descriptionFromObj: string = obj.description;
        if (descriptionFromObj === undefined) {
            throw new Error("Missing required field 'description' in objectToChat");
        }
        chat.description = descriptionFromObj;
    }
    else {
        chat.description = obj.description;
    }

    if (requiredFieldsForChat.includes("defaultRoleId")) {
        const defaultRoleIdFromObj: number = obj.defaultRoleId || obj.default_role_id;
        if (defaultRoleIdFromObj === undefined) {
            throw new Error("Missing required field 'defaultRoleId' in objectToChat");
        }
        chat.defaultRoleId = defaultRoleIdFromObj;
    }
    else {
        chat.defaultRoleId = obj.defaultRoleId || obj.default_role_id;
    }

    if (requiredFieldsForChat.includes("createdAt")) {
        const createdAtFromObj: number | undefined = obj.created_at || obj.createdAt;
        if (createdAtFromObj === undefined) {
            throw new Error("Missing required field 'createdAt' in objectToChat");
        }
        chat.createdAt = createdAtFromObj;
    }
    else {
        chat.createdAt = obj.created_at || obj.createdAt;
    }

    if (requiredFieldsForChat.includes("small_avatar_id")) {
        const smallAvatarIdFromObj: number = obj.small_avatar_id || obj.smallAvatarId;
        if (smallAvatarIdFromObj === undefined) {
            throw new Error("Missing required field 'small_avatar_id' in objectToChat");
        }
        chat.smallAvatarId = smallAvatarIdFromObj;
    }
    else {
        chat.smallAvatarId = obj.small_avatar_id || obj.smallAvatarId;
    }

    if (requiredFieldsForChat.includes("large_avatar_id")) {
        const largeAvatarIdFromObj: number = obj.large_avatar_id || obj.largeAvatarId;
        if (largeAvatarIdFromObj === undefined) {
            throw new Error("Missing required field 'large_avatar_id' in objectToChat");
        }
        chat.largeAvatarId = largeAvatarIdFromObj;
    }
    else {
        chat.largeAvatarId = obj.large_avatar_id || obj.largeAvatarId;
    }

    if (requiredFieldsForChat.includes("fullscreen_avatar_id")) {
        const fullscreenAvatarIdFromObj: number = obj.fullscreen_avatar_id || obj.fullscreenAvatarId;
        if (fullscreenAvatarIdFromObj === undefined) {
            throw new Error("Missing required field 'fullscreen_avatar_id' in objectToChat");
        }
        chat.fullscreenAvatarId = fullscreenAvatarIdFromObj;
    }
    else {
        chat.fullscreenAvatarId = obj.fullscreen_avatar_id || obj.fullscreenAvatarId;
    }

    return chat;
}