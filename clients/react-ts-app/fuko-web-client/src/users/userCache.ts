// import { type User } from "./models/user";
// import { UserCacheDatabase } from "./internal/db/userCacheDatabase";
// import { getUserInfoRequest, updateMyAvatarRequest } from "./internal/api/userApi";
// import { parseJwt } from "../auth/identity-util";
// import InternalLogicError from "../general/errors/classes/internalLogicError";

// export class UserCache {
//     private db: UserCacheDatabase;
//     // Список id пользователей, которых мы уже синхронизировали после входа
//     private syncUserIdsSet: Set<number>;
//     /*
//         Откуда мы получили пользователя. Это необходимо что бы контроллировать разрыв в данных между кешем и бекендом.
//         Например, если если мы выйдем из чата и позже зайдем обратно, но пользователь обновился - мы это не узнаем.
//         Следовательно, если cachedUsersFromMyChatsMap пустой, то мы можем считать, что данные в кеше актуальны.
//     */
//     private cachedUsersFromMyChatsMap: Map<number, Set<number>>; // key: userId, value: Set<chatId>

//     constructor() {
//         this.db = new UserCacheDatabase();
//         this.syncUserIdsSet = new Set();
//         this.cachedUsersFromMyChatsMap = new Map<number, Set<number>>();
//     }

//     async getUserById(userId: number, fromChatId: number | undefined = undefined): Promise<User | null> {
//         try {
//             //TODO: реалзовать cachedUsersFromMyChatsMap
//             let user: User | undefined = undefined;
//             if (this.syncUserIdsSet.has(userId)) {
//                 user = await this.db.users.get(userId);
//                 if (user) {
//                     console.log(`User with ID ${userId} fetched from cache.`);
//                     return user;
//                 }
//             }

//             user = await getUserInfoRequest(userId);
//             if (!user) {
//                 console.error(`Failed to fetch user with ID ${userId} from API.`);
//                 return null;
//             }

//             this.db.users.put(user);
//             console.log(`User with ID ${userId} fetched from API and cached.`);

//             return user;
//         } catch (error) {
//             console.error("Error fetching user by Id: ", error);
//             return null;
//         }
//     }

//     public async updateMyAvatar(createdToken: string, authToken: string): Promise<boolean> {
//         return updateMyAvatarRequest(createdToken, authToken).then(success => {
//             if (!success)
//                 return success;
//             const userId = parseJwt(authToken).userId;
//             const fileId = parseJwt(createdToken).fileId;

//             if (!userId || !fileId) {
//                 console.error(`no found userId or fileId from tokens: userId=${userId} fileId=${fileId}`)
//                 throw new InternalLogicError(`no found userId or fileId from tokens: userId=${userId} fileId=${fileId}`);
//             }

//             asdsadas//TODO

//             return success;
//         })
//     }   
// }