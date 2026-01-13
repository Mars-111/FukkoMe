import { useSocketStore, type PendingEntity } from "./useSocket";



export function hasSubscribe(entity: PendingEntity): boolean {
    const subs = useSocketStore.getState().localSubscriptions.get(entity);
    return subs ? subs > 0 : false;    
}