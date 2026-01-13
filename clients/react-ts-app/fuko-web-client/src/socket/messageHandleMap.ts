import { useIdentityStroe } from "../auth/hooks/useIdentity";
import { executeChatEvent } from "../chat-events/chatEventUtils";
import { useChatCacheMetaStore } from "../chats/hooks/useChatCacheMetaStore";
import { useUserStatusesStore } from "../user-statuses/useUserStatusesStore";
import { updateUser } from "../users/utils/userUtils";

export const messageHandleMap: Map<string, (data: any) => void> = new Map<string, (data: any) => void>([
    ["status", handleStatusUpdate],
    ["user_update", handleUserUpdate],
    ["chat_event", executeChatEvent],
    // ["chat_message", handleChatMessage],
]);

interface StatusUpdateDto {
    type: "status";
    session: string;
    online: boolean;
    userId: number;
};

function handleStatusUpdate(data: StatusUpdateDto): void {
    if (!data) {
        console.error("Received empty status update");
        return;
    }
    if (data.type !== "status") {
        console.error("Received unexpected status update type:", data.type);
        return;
    }
    if (!data.session) {
        console.error("session field missing");
        return;
    }
    if (data.userId === undefined || data.userId === null || data.userId < 0) {
        console.error("Field 'userId' is missing or invalid");
        return;
    }

    console.log("Status update received: ", data);

    if (data.online)
        useUserStatusesStore.getState().addOnlineSession(data.userId, data.session);
    else
        useUserStatusesStore.getState().removeOnlineSession(data.userId, data.session);
}

interface UserUpdateDto {
    id: number;
    version: number;
    username: string;
    is_enabled: boolean; //Чуть позже
    small_avatar: number;
    large_avatar: number;
    fullscreen_avatar: number;
}

function handleUserUpdate(data: UserUpdateDto) {
    updateUser({
        id: data.id,
        version: data.version,
        username: data.username,
        smallAvatarId: data.small_avatar,
        largeAvatarId: data.large_avatar,
        fullscreenAvatarId: data.fullscreen_avatar
    });
}

interface JoinToChatDto {
    chat_id: number;
    user_id: number;
}

function handleJoinToChat(data: JoinToChatDto) {
    if (!data || data.chat_id === undefined || data.user_id === undefined) {
        console.error("Received empty join to chat data");
        return;
    }
    if (data.user_id === useIdentityStroe.getState().myUserId) {
        useChatCacheMetaStore.getState().addMyChatId(data.chat_id);
    }
    //TODO
}
