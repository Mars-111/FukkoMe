import { useEffect, useRef, useState } from "react";
import type { UserStatus } from "./status";
import { getUserStatusRequest } from "./statusApi";
import { useUserStatusesStore } from "./useUserStatusesStore";



export function useUserStatus(userId: number): UserStatus | "await" | "not-user-found" {
    const previousUserId = useRef<number>(userId);

    const userStatuses = useUserStatusesStore(state => state.userStatuses);
    const setOnlineSessions = useUserStatusesStore(state => state.setOnlineSessions);
    const getUserStatus = useUserStatusesStore(state => state.getUserStatus);
    const startStatusIsFetched = useUserStatusesStore(state => state.startStatusIsFetched);
    const setStartStatusFetched = useUserStatusesStore(state => state.setStartStatusFetched);
    const setLastSeen = useUserStatusesStore(state => state.setLastSeen);
    const [status, setStatus] = useState<UserStatus | "await" | "not-user-found">("await");


    useEffect(() => {
        if (previousUserId.current !== userId) {
            const newStatus = getUserStatus(userId) || "await";
            console.log("Устанавлиаем стастус, тк поменялся UserId: ", newStatus)
            setStatus(newStatus);
            previousUserId.current = userId;
        }
    }, [userId]);


    useEffect(() => {
        if (!startStatusIsFetched(userId)) {
            getUserStatusRequest(userId).then((data) => {
                setStartStatusFetched(userId, true);
                if (!data) {
                    setStatus("not-user-found");
                    return;
                }
                const online = data.onlineSessions ? data.onlineSessions.size > 0 : false;
                setStatus({online: online, lastSeen: data.lastSeen});
                if (online)
                    setOnlineSessions(userId, data.onlineSessions!);
                else 
                    setOnlineSessions(userId, new Set())
                    setLastSeen(userId, data.lastSeen);
            }).catch(() => {
                setStatus("not-user-found");
            });
        }
    }, [userStatuses, userId]);

    useEffect(() => {
        const newStatus = getUserStatus(userId) || status;

        setStatus(newStatus);
    }, [userStatuses]);

    return status;
}