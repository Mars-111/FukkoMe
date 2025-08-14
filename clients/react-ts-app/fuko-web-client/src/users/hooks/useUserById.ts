import { useLiveQuery } from "dexie-react-hooks";
import { userDb } from "../internal/db/userCacheDatabase";
import { isActual, syncUserIfVersionOutdated } from "../internal/utils/userCahceUtils";
import { useUserCacheMetaStore } from "./useUserCacheMetaStore";
import { useEffect, useRef, useState } from "react";
import { type User } from "../models/user";


export function useUserById(userId: number) {
    const stateMetaCache = useUserCacheMetaStore();
    const userFromDb: User | undefined = useLiveQuery(() => userDb.users.get(userId), [userId]);

    const [user, setUser] = useState<User | null | undefined>(undefined);
    const isNotFirstSyncRef = useRef<boolean>(false);

    const hasGeneralChatsWithUserRef = 
        useRef<boolean>(stateMetaCache.cachedGeneralChatsWithUsersMap.has(userId));
    useEffect(() => {
        hasGeneralChatsWithUserRef.current = stateMetaCache.cachedGeneralChatsWithUsersMap.has(userId);
    }, [stateMetaCache])

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
        if (user === undefined || (!isActual(userId) && (!isNotFirstSyncRef || hasGeneralChatsWithUserRef.current))) {
            console.log("Синхранизируем пользователя: " + user);
            if (typeof userId !== "number") { //Временно
                console.error("Invalid userId passed to Dexie.get:", userId);
            } 
            syncUserIfVersionOutdated(userId);
        }
    }, [stateMetaCache, user]);

    return user;
}
