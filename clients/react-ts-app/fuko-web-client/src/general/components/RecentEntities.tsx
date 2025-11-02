import { useNavigate } from "react-router-dom";
import type { RecentEntity } from "../internal/db/cacheRecentEntityDb";
import { useRecentUsers } from "../utils/recentEntityHooks";
import { UserCell } from "./EntitiesCells";
import './RecentEntities.css'



export function RecentEntities({ limit, baseOpenEntityUrl }: { limit: number, baseOpenEntityUrl?: string }) {
    const recent: RecentEntity[] | undefined = useRecentUsers(limit);
    const navigate = useNavigate();

    return (
        <div className="recent-container">
            {!recent && <p>Загрука недавних пользлвателей</p>}
            {recent && recent.map(r => {
                if (r.type === 'user') {
                    return <UserCell key={r.idInRecentDb} id={r.entityId} onClick={() => { navigate(`${baseOpenEntityUrl || "/app"}/user/${r.entityId}`) }} />
                }
                else {
                    console.warn("Чаты пока не готовы")
                    return null;
                }
            })}
        </div>
    );
}