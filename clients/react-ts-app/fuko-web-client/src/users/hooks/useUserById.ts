import { useLiveQuery } from "dexie-react-hooks";
import { userDb } from "../internal/db/userCacheDatabase";
import { userIsActual, syncUser } from "../utils/userUtils";
import { useUserCacheMetaStore } from "./useUserCacheMetaStore";
import { useEffect, useRef, useState } from "react";
import { type User } from "../models/user";
import { useIdentity } from "../../auth/hooks/useIdentity";


export function useUserById(userId: number) {
    const { myUserId } = useIdentity();
    const stateMetaCache = useUserCacheMetaStore();
    const userFromDb: User | undefined = useLiveQuery(() => {
        if (!userId) return undefined;
        return userDb.users.get(userId);
    }, [userId]);

    const [user, setUser] = useState<User | null | undefined>(undefined);
    const isNotFirstSyncRef = useRef<boolean>(false);

    const hasGeneralChatsWithUserRef = 
        useRef<boolean>(stateMetaCache.cachedGeneralChatsWithUsersMap.has(userId));
    
    useEffect(() => {
        hasGeneralChatsWithUserRef.current = stateMetaCache.cachedGeneralChatsWithUsersMap.has(userId);
    }, [stateMetaCache]);

    //активируем обновления из бд
    useEffect(() => {
        let userState: User | null | undefined = userFromDb;
        if (userState === undefined && isNotFirstSyncRef.current === true) {
            userState = null;
        }

        setUser(userState);
        isNotFirstSyncRef.current = true;
    }, [userFromDb]);

    useEffect(() => {
        console.log("user: ", user);
        if (user === undefined || (!userIsActual(userId, myUserId || undefined) && (!isNotFirstSyncRef || hasGeneralChatsWithUserRef.current))) {
            syncUser(userId);
            isNotFirstSyncRef.current = false;
        }
    }, [stateMetaCache, user]);

    return user;
}
