import { useSocketStore } from "./useSocket";



export function hasSubscribe(topic: string) {
    const subs = useSocketStore.getState().localSubscriptions.get(topic);
    return subs ? subs > 0 : false;    
}