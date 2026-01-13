import { useLiveQuery } from "dexie-react-hooks";
import { userDb } from "../internal/db/userCacheDatabase";
import { userIsActual, syncUser } from "../utils/userUtils";
import { useUserCacheMetaStore } from "./useUserCacheMetaStore";
import { useEffect, useRef, useState } from "react";
import { type User } from "../models/user";
import { useIdentity } from "../../auth/hooks/useIdentity";


export function useUserById(userId: number): User | "not found" | "start state" {
    const { myUserId } = useIdentity();
    const stateMetaCache = useUserCacheMetaStore();
    const userFromDb: User | undefined | "start state" = useLiveQuery(() => {
        if (!userId) return undefined;
        return userDb.users.get(userId);
    }, [userId], "start state");

    const [user, setUser] = useState<User | "not found" | "start state">("start state");
    const isNotFirstSyncRef = useRef<boolean>(false);

    //активируем обновления из бд
    useEffect(() => {
        let userState: User | undefined | "start state" = userFromDb;
        if (userState === "start state") return;
        if (userState === undefined && isNotFirstSyncRef.current === true) {
            setUser("not found");
            return;
        }
        else if (userState !== undefined) {
            setUser(userState);
        }
    }, [userFromDb, isNotFirstSyncRef.current]);

    useEffect(() => {
        if (userFromDb === undefined && !userIsActual(userId, myUserId || undefined)) {
            syncUser(userId);
            isNotFirstSyncRef.current = false;
        }
    }, [stateMetaCache, userFromDb]);

    return user;
}