import { Avatar } from "../../users/components/Avatar";
import { ShimmerText } from "./ShimmerText";
import './EntityCell.css';
import { useUserById } from "../../users/hooks/useUserById";
import { useUserByIdFromDb } from "../../users/hooks/useUserByIdFromDb";

export function UserFromDbCell({ id, onClick }: { id: number, onClick: () => void }) {
    const user = useUserByIdFromDb(id);
    return <EntityCell name={user ? user.username : null} avatarId={user ? user.smallAvatarId : null} onClick={onClick} />;
}

export function UserCell({ id, onClick }: { id: number, onClick: () => void }) {
    const user = useUserById(id);
    return <EntityCell name={user ? user.username : null} avatarId={user ? user.smallAvatarId : null} onClick={onClick} />;
}

export function EntityCell({ name, avatarId, onClick }: { name: string | null, avatarId: number | null, onClick: () => void }) {
    return (
        <button className="entity-cell " onClick={onClick}>
            <Avatar avatarId={avatarId} circle size="small" />
            {name ? <span className="entity-cell-name">{name}</span> : <ShimmerText />}
        </button>
    )
}