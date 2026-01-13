// import { create } from "zustand";

// export type StateChatRole = {
//     /*
//         Список id ролей, которые уже были синхронизированы после входа.
//         Если роли нет в этом Set → нужно проверить её на актуальность и при необходимости обновить.
//     */
//     syncRoleIdsAfterOpenSet: Set<number>;
//     addSyncRoleIdAfterOpen: (roleId: number) => void;

//     /*
//         Нуждается ли роль в обновлении?
//         Map: roleId → boolean
//         true означает, что нужно обновить из бэкенда даже если она «актуальна».
//     */
//     requiredRoleUpdateMap: Map<number, boolean>;
//     setRequiredRoleUpdate: (roleId: number, required: boolean) => void;
// };

// export const useChatRoleCacheMetaStore = create<StateChatRole>((set, get) => ({
//     syncRoleIdsAfterOpenSet: new Set<number>(),
//     addSyncRoleIdAfterOpen: (roleId: number) =>
//         set((state) => {
//             const newSet = new Set(state.syncRoleIdsAfterOpenSet);
//             newSet.add(roleId);
//             return { syncRoleIdsAfterOpenSet: newSet };
//         }),

//     requiredRoleUpdateMap: new Map<number, boolean>(),
//     setRequiredRoleUpdate: (roleId: number, required: boolean) =>
//         set((state) => {
//             const newMap = new Map(state.requiredRoleUpdateMap);
//             newMap.set(roleId, required);
//             return { requiredRoleUpdateMap: newMap };
//         }),
// }));
