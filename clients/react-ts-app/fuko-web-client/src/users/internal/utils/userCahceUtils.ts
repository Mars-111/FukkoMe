import type { User } from "../../models/user";
import { getUserInfoRequest, getUserVersion } from "../api/userApi";
import { userDb } from "../db/userCacheDatabase";
import { useUserCacheMetaStore } from "../../hooks/useUserCacheMetaStore";

export function isActual(userId: number): boolean {
    const stateMetaCache = useUserCacheMetaStore.getState();
    if (!stateMetaCache.syncUserIdsAfterOpenSet.has(userId)) {
        console.log("Первичной синхранизации нету => не актульный поьзователь.")
        return false;
    }
    const generalChatsWithUser: Set<number> | undefined = 
        stateMetaCache.cachedGeneralChatsWithUsersMap.get(userId);
    if (!generalChatsWithUser || generalChatsWithUser.size <= 0) {
        console.log("Общих чатов нету => не актульный поьзователь.")
        return false;
    }
    const requiredUserUpdate = stateMetaCache.requiredUserUpdateMap.get(userId);
    if (requiredUserUpdate) {
        console.log("Требуеться обновлеие пользователя (!requiredUserUpdate).");
        return false;
    }
    return true;
}


export function setUserRequiredUpdate(userId: number, required: boolean) {
    useUserCacheMetaStore.getState().setRequiredUserUpdate(userId, required);
}

export async function syncUserIfVersionOutdated(userId: number) {
    const userFromDb = await userDb.users.get(userId);
    if (userFromDb) {
        /*
            Запись в бд (кэш) есть. Значит нужно сначала получить актуальную версию по запросу:
            Совпадает? => 1. Ничего не делаем, у нас актуальная версия 
            Иначе (не свопадает) => 2. Запрашиваем пользователя и перезаписываем его в кэше (после if).
        */
        const actualUserVersion: number = await getUserVersion(userId);
        if (userFromDb.version === actualUserVersion) 
            return;
    }
    /*
        Записи в бд (кэше) нету или она не актуальна. 
        Значит запрашиваем пользователя и записываем в бд (кэш).
    */
    const actualUser: User = await getUserInfoRequest(userId);
    console.log("actual user: ", actualUser);
    if (userFromDb)
        userDb.users.put(actualUser, userId);
    else 
        userDb.users.add(actualUser, userId);

    const syncUserIdsAfterOpen: boolean = useUserCacheMetaStore.getState().syncUserIdsAfterOpenSet.has(userId);

    if (!syncUserIdsAfterOpen) {
        useUserCacheMetaStore.getState().addSyncUserIdsAfterOpen(userId);
    }
}

export async function updateUser(user: User) {
    await userDb.users.update(user.id, user).then((updated) => {
        if (updated) {
            console.log("User updated successfully:", updated);
        } else {
            console.log("User update failed");
        }
    });
}