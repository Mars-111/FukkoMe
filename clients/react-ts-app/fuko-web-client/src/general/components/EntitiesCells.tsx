import { Avatar, AwaitAvatar, FullscreenChatAvatar, FullscreenUserAvatar, LargeChatAvatar, LargeUserAvatar, SmallChatAvatar, SmallUserAvatar, type AvatarSizes } from "../../users/components/Avatar";
import { ShimmerText } from "./ShimmerText";
import './EntityCell.css';
import { useUserById } from "../../users/hooks/useUserById";
import { useUserByIdFromDb } from "../../users/hooks/useUserByIdFromDb";
import { useChatById } from "../../chats/hooks/useChatById";
import { useChatByIdFromDb } from "../../chats/hooks/useChatByIdFromDb";
import { userFound } from "../../users/utils/userUtils";
import { useChatRoleById } from "../../chats/hooks/useChatRoleById";
import { useChatMembers } from "../../chats/hooks/useChatMembers";


export function UserFromDbCell({ id, onClick, avatarSize, onMouseDown, selected = false, circle = true, roleName }: { id: number, onClick: () => void, avatarSize: AvatarSizes, selected?: boolean, circle?: boolean, onMouseDown?: () => void, roleName?: string }) {
    const user = useUserByIdFromDb(id);
    return (
        <button className={"entity-cell " + (selected ? "selected" : "")} onClick={onClick} onMouseDown={onMouseDown}>
            {!user && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium") 
                && <AwaitAvatar circle={circle} size="small" />}
            {!user && avatarSize === "large"
                && <AwaitAvatar circle={circle} size="large" />}
            {!user && avatarSize === "xl"
                && <AwaitAvatar circle={circle} size="xl" />}
            {user && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium")
                && <SmallUserAvatar user={user} circle />}
            {user && avatarSize === "large"
                && <LargeUserAvatar user={user} circle />}
            {user && avatarSize === "xl"
                && <FullscreenUserAvatar user={user} circle />}
            {user ? <span className="entity-cell-name">{user.username}</span> : <ShimmerText />}
            {roleName && roleName}
        </button>
    );
}

export function UserCell({ id, onClick, avatarSize, onMouseDown, selected = false, circle = true, roleName }: { id: number, onClick: () => void, avatarSize: AvatarSizes, onMouseDown?: () => void, selected?: boolean, circle?: boolean, roleName?: string }) {
    const user = useUserById(id);
    return (
        <button className={"entity-cell " + (selected ? "selected" : "")} onClick={onClick} onMouseDown={onMouseDown}>
            {!userFound(user) && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium") 
                && <AwaitAvatar circle={circle} size="small" />}
            {!userFound(user) && avatarSize === "large"
                && <AwaitAvatar circle={circle} size="large" />}
            {!userFound(user) && avatarSize === "xl"
                && <AwaitAvatar circle={circle} size="xl" />}
            {userFound(user) && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium")
                && <SmallUserAvatar user={user} circle />}
            {userFound(user) && avatarSize === "large"
                && <LargeUserAvatar user={user} circle />}
            {userFound(user) && avatarSize === "xl"
                && <FullscreenUserAvatar user={user} circle />}
            {userFound(user) ? <span className="entity-cell-name">{user.username}</span> : <ShimmerText />}
            {roleName && roleName}
        </button>
    );
}

export function UserAndHisRoleCell({ id, onClick, avatarSize, onMouseDown, selected = false, circle = true, roleId }: { id: number, onClick: () => void, avatarSize: AvatarSizes, onMouseDown?: () => void, selected?: boolean, circle?: boolean, roleId: number }) {
    const role = useChatRoleById(roleId);
    return (
        <UserCell roleName={typeof role  !== "string" ? role.name : "role undefied. id: " + roleId} id={id} onClick={onClick} onMouseDown={onMouseDown} selected={selected} circle={circle} avatarSize={avatarSize} />
    );
}

export function ChatFromDbCell({ id, onClick, avatarSize, onMouseDown, selected = false, circle = true }: { id: number, onClick?: () => void, avatarSize: AvatarSizes, selected?: boolean, circle?: boolean, onMouseDown?: () => void }) {
    const chat = useChatByIdFromDb(id);
    const members = useChatMembers(id);

    return (
        <button
            className={"entity-cell " + (selected ? "selected" : "")}
            onClick={onClick}
            onMouseDown={onMouseDown}
        >
            <div className="entity-cellavatar-block">
            {/* аватар */}
            {chat === "finding" && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium") 
                && <AwaitAvatar circle={circle} size="small" />}
            {chat === "finding" && avatarSize === "large"
                && <AwaitAvatar circle={circle} size="large" />}
            {chat === "finding" && avatarSize === "xl"
                && <AwaitAvatar circle={circle} size="xl" />}

            {typeof chat !== "string" && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium")
                && <SmallChatAvatar chat={chat} circle />}
            {typeof chat !== "string" && avatarSize === "large"
                && <LargeChatAvatar chat={chat} circle />}
            {typeof chat !== "string" && avatarSize === "xl"
                && <FullscreenChatAvatar chat={chat} circle />}
            </div>

            {/* название */}
            {typeof chat !== "string"
                ? (
                    <div className="entity-cell-title-block">
                        <span className="entity-cell-name">{chat.name}</span>
                        <span className="entity-cell-tag">
                            @{chat.tag}
                        </span>
                    </div>
                ) : (
                    <ShimmerText />
                )
            }

            {/* количество участников */}
            {members instanceof Map && (
                <span className="chat-members-count">
                    {members.size} участников
                </span>
            )}
        </button>
    );
}

export function ChatCell({ id, onClick, avatarSize, onMouseDown, selected = false, circle = true }: { id: number, onClick: () => void, avatarSize: AvatarSizes, selected?: boolean, circle?: boolean, onMouseDown?: () => void }) {
    const chat = useChatById(id);
    const members = useChatMembers(id);

    return (
        <button
            className={"entity-cell " + (selected ? "selected" : "")}
            onClick={onClick}
            onMouseDown={onMouseDown}
        >
            <div className="entity-cellavatar-block">
            {/* аватар */}
            {chat === undefined && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium") 
                && <AwaitAvatar circle={circle} size="small" />}
            {chat === undefined && avatarSize === "large"
                && <AwaitAvatar circle={circle} size="large" />}
            {chat === undefined && avatarSize === "xl"
                && <AwaitAvatar circle={circle} size="xl" />}

            {chat && (avatarSize === "small" || avatarSize === "small-medium" || avatarSize === "medium")
                && <SmallChatAvatar chat={chat} circle />}
            {chat && avatarSize === "large"
                && <LargeChatAvatar chat={chat} circle />}
            {chat && avatarSize === "xl"
                && <FullscreenChatAvatar chat={chat} circle />}
            </div>

            {/* название */}
            {chat
                ? (
                    <div className="entity-cell-title-block">
                        <span className="entity-cell-name">{chat.name}</span>
                        <span className="entity-cell-tag">
                            @{chat.tag}
                        </span>
                    </div>
                ) : (
                    <ShimmerText />
                )
            }

            

            {/* количество участников */}
            {members instanceof Map && (
                <span className="chat-members-count">
                    {members.size} участников
                </span>
            )}
        </button>
    );
}

export function EntityCell({ name, avatarId, onClick, avatarSize, selected, onMouseDown }: { name: string | null, avatarId: number | null, onClick?: () => void, avatarSize: AvatarSizes, selected?: boolean, onMouseDown?: ()=> void }) {
    return (
        <button className={"entity-cell " + (selected ? "selected" : "")} onClick={onClick} onMouseDown={onMouseDown}>
            <Avatar avatarId={avatarId} circle size={avatarSize} />
            {name ? <span className="entity-cell-name">{name}</span> : <ShimmerText />}
        </button>
    )
}

