import { useLiveQuery } from "dexie-react-hooks";
import { userDb } from "../internal/db/userCacheDatabase";
import { type User } from "../models/user";
import { useEffect, useRef } from "react";
import { syncUser } from "../utils/userUtils";


export function useUserByIdFromDb(userId: number) {
    const isNotFirstSyncRef = useRef<boolean>(true);
    const userFromDb: User | undefined = useLiveQuery(() => {
        if (!userId) return undefined;
        return userDb.users.get(userId) || null;
    }, [userId]);

    useEffect(() => {
        if (userFromDb === null && isNotFirstSyncRef) {
            syncUser(userId);
            isNotFirstSyncRef.current = false;
        }
    }, []);
    return userFromDb;
}
