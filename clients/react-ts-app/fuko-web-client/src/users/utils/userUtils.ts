import { debugUserFiedls, type User } from "../models/user";
import { getUserCreatedAtRequest, getUserProfileRequest, getUserVersion, likeUsername, type UserProfileResponse } from "../internal/api/userApi";
import { userDb } from "../internal/db/userCacheDatabase";
import { useUserCacheMetaStore } from "../hooks/useUserCacheMetaStore";
import { hasSubscribe } from "../../socket/useSocketUtil";

export function userIsActual(userId: number, myUserId?: number): boolean {
    const stateMetaCache = useUserCacheMetaStore.getState();
    if (!stateMetaCache.syncUserIdsAfterOpenSet.has(userId)) {
        console.log("Первичной синхранизации нету => не актульный поьзователь.")
        return false;
    }

    if (userId === myUserId) {
        return true; //Сокет в бекенде все будет грузить
    }

    const requiredUserUpdate = stateMetaCache.requiredUserUpdateMap.get(userId);
    if (requiredUserUpdate) {
        console.log("Требуеться обновлеие пользователя");
        return false;
    }

    if (hasSubscribe("u:" + userId)) {
        return true;
    }

    const generalChatsWithUser: Set<number> | undefined = 
        stateMetaCache.cachedGeneralChatsWithUsersMap.get(userId);
    if (!generalChatsWithUser || generalChatsWithUser.size <= 0) {
        console.log("Общих чатов нету => не актульный поьзователь.")
        return false;
    }
    
    
    return true;
}

// export function versionWasCheckedMoreThanMsAgo(userId: number, ms: number) {
//     console.log("nfa");
//     const lastCheck = useUserCacheMetaStore.getState().lastCheckUserVersionMap.get(userId);
//     if (!lastCheck) {
//         // Если никогда не проверяли → считаем, что прошло "очень давно"
//         console.log("Записи о прошлом времени проверки версии нету");
//         return true;
//     }
//     console.log("Время: " + (Date.now() - lastCheck > ms));
//     return Date.now() - lastCheck > ms;
// }

export function setUserRequiredUpdate(userId: number, required: boolean) {
    useUserCacheMetaStore.getState().setRequiredUserUpdate(userId, required);
}


export async function syncUser(userId: number) {
    const sync = async () => {
        const userFromDb = await userDb.users.get(userId);
        if (userFromDb) {
            /*
                Запись в бд (кэш) есть. Значит нужно сначала получить актуальную версию по запросу:
                Совпадает? => 1. Ничего не делаем, у нас актуальная версия 
                Иначе (не свопадает) => 2. Запрашиваем пользователя и перезаписываем его в кэше (после if).
            */
            const actualUserVersion: number = await getUserVersion(userId);
            console.log("Проверяем актуальность пользователя: ", userFromDb, " Актуальная версия: ", actualUserVersion);
            if (userFromDb.version === actualUserVersion)
                return;
        }
        /*
            Записи в бд (кэше) нету или она не актуальна. 
            Значит запрашиваем пользователя и записываем в бд (кэш).
        */
        
        const userProfileFromResponce: UserProfileResponse = await getUserProfileRequest(userId);
        const actualUser: User = {
            id: userProfileFromResponce.id,
            username: userProfileFromResponce.username,
            version: userProfileFromResponce.version,
            smallAvatarId: userProfileFromResponce.small_avatar,
            largeAvatarId: userProfileFromResponce.large_avatar,
            fullscreenAvatarId: userProfileFromResponce.fullscreen_avatar
        };
        if (userFromDb)
            userDb.users.update(userId, actualUser);
        else 
            userDb.users.add(actualUser, userId);
    };
    
    await sync();

    const syncUserIdsAfterOpen: boolean = useUserCacheMetaStore.getState().syncUserIdsAfterOpenSet.has(userId);

    if (!syncUserIdsAfterOpen) {
        useUserCacheMetaStore.getState().addSyncUserIdsAfterOpen(userId);
    }

    // useUserCacheMetaStore.getState().setLastCheckUserVersion(userId);
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


export async function uploadUserCreatedAt(userId: number) {
    console.log("Uploading user createdAt for userId: ", userId);
    const user = await userDb.users.get(userId);
    if (!user || user?.createdAt) {
        console.warn("User not found or createdAt already set:", user);
        return;
    }
    const createdAt: number = await getUserCreatedAtRequest(userId);
    console.log("update createdAt for user " + userId + ": " + createdAt);
    userDb.users.update(userId, { createdAt });
}

export async function likeUsernameAndSaveUsers(query: string, limit: number): Promise<User[]> {
    const usersProfileFromResponce = await likeUsername(query, limit);
    const users: User[] = [];
    if (users) {
        usersProfileFromResponce.forEach(async userProfileFromResponce => {
            const user: User = {
                id: userProfileFromResponce.id,
                username: userProfileFromResponce.username,
                version: userProfileFromResponce.version,
                smallAvatarId: userProfileFromResponce.small_avatar,
                largeAvatarId: userProfileFromResponce.large_avatar,
                fullscreenAvatarId: userProfileFromResponce.fullscreen_avatar
            };
            users.push(user);
            console.log("Дебаг пользователя из likeUsername: " + debugUserFiedls(user));
            const oldUser = await userDb.users.get(user.id);
            if (oldUser) {
                if (oldUser.version < user.version) {
                    userDb.users.put(user, user.id);
                }
            }
            else {
                userDb.users.put(user, user.id);
            }
        });
    }
    return users;
}