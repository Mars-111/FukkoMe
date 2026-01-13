import type { RecentEntity } from "../internal/db/cacheRecentEntityDb";
import { useRecentEntities } from "../utils/recentEntityHooks";
import { ChatCell, ChatFromDbCell, UserCell, UserFromDbCell } from "./EntitiesCells";
import './RecentEntities.css'



export function RecentEntities({ limit, onClick, onMouseDown }: { limit: number, onClick?: (recent: RecentEntity) => void, onMouseDown?: (recent: RecentEntity) => void}) {
    const recent: RecentEntity[] | undefined = useRecentEntities(limit);

    return (
        <div className="recent-container">
            {!recent && <p>Загрука недавних пользлвателей</p>}
            {recent && recent.map(r => {
                if (r.type === 'user') {
                    return <UserFromDbCell key={r.idInRecentDb} id={r.entityId} onClick={() => onClick?.(r)} onMouseDown={() => onMouseDown?.(r)} avatarSize="small-medium" />
                }
                else if (r.type === 'chat') {
                    return <ChatFromDbCell key={r.idInRecentDb} id={r.entityId} onClick={() => onClick?.(r)} onMouseDown={() => onMouseDown?.(r)} avatarSize="small-medium" />
                }
            })}
        </div>
    );
}