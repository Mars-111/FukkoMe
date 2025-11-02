import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { useUserStatusesStore } from "../user-statuses/useUserStatusesStore";
import { updateUser } from "../users/utils/userUtils";
import { useIdentity } from "../auth/hooks/useIdentity";

interface PendingAction {
    type: "subscribe" | "unsubscribe";
    entity: "chat" | "user";
    id: number;
}

interface SocketStore {
    socket: WebSocket | null;
    waitSocketOpen: boolean;
    isOpen: boolean,
    localSubscriptions: Map<string, number>; //topic и сколько хуков подписанно
    pendingActions: PendingAction[];
    countCopiesOfHook: number;
    addCountCopiesOfHook: () => void;
    reduceCountCopiesOfHook: () => void;
    setWaitSocketOpen: (wait: boolean) => void;
    setSocket: (socket: WebSocket | null) => void;
    setOpen: (open: boolean) => void;
    subscribe: (topic: string) => void;
    unsubscribe: (topic: string) => void;
    flushActions: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => {
    function pushAction(action: PendingAction) { 
        set((state) => {
            const pending = [...state.pendingActions];

            const oppositeType = action.type === "subscribe" ? "unsubscribe" : "subscribe";

            // Найти последний противоположный (если есть) и удалить его — действия взаимоуничтожаются
            let oppositeIndex = -1;
            for (let i = pending.length - 1; i >= 0; i--) {
                if (pending[i].topic === action.topic && pending[i].type === oppositeType) {
                    oppositeIndex = i;
                    break;
                }
            }

            if (oppositeIndex !== -1) {
                pending.splice(oppositeIndex, 1);
                return { pendingActions: pending };
            }

            pending.push(action);
            return { pendingActions: pending };
        });

        // не вызываем flushActions внутри set — даём возможность другим вызовам корректно попасть в очередь
    }



    function isOpenFast(socket: WebSocket | null | undefined): boolean {
        return !!socket && (socket.readyState === WebSocket.OPEN);
    }

    return {
        socket: null,
        isOpen: false,
        waitSocketOpen: false,
        setWaitSocketOpen: (wait: boolean) => {
            set({ waitSocketOpen: wait });
        },
        localSubscriptions: new Map<string, number>(),
        pendingActions: [],
        countCopiesOfHook: 0,
        setSocket: (socket: WebSocket | null) => {
            // НЕ вызываем state.setWaitSocketOpen / state.setOpen внутри apdater
            if (get().socket?.readyState === WebSocket.OPEN) {
                try {
                    get().socket!.close();
                }
                catch (err) {
                    console.error("Error closing existing WebSocket:", err);
                }
            }
            if (socket === null) {
                // явно сбросим поля
                set({ socket: null, waitSocketOpen: false, isOpen: false });
            } else {
                set({ socket });
            }
        },
        setOpen: (open: boolean) => set({ isOpen: open }),
        subscribe: (topic: string) => {
            pushAction({ type: "subscribe", topic });
            setTimeout(() => get().flushActions(), 0); //Gpt сказал так сделать, что бы изежать гонки
        },
        unsubscribe: (topic: string) => {
            pushAction({ type: "unsubscribe", topic });
            setTimeout(() => get().flushActions(), 0); //Gpt сказал так сделать, что бы изежать гонки
        },
        flushActions: () => {
            const state = get();
            const socket = state.socket;
            if (!socket || !isOpenFast(socket)) return;

            // Берём snapshot очереди и очищаем pendingActions в стейте сразу
            const toFlush = [...state.pendingActions];
            set({ pendingActions: [] });

            // Копия Map локальных подписок, которую обновим в память после успешных отправок
            const newLocalSubs = new Map(state.localSubscriptions);

            for (const { type, topic } of toFlush) {
                if (type === "subscribe") {
                    // Если ещё не подписаны на сервере (count === 0) — отправляем S
                    const count = newLocalSubs.get(topic) || 0;
                    if (count === 0) {
                        try {
                            socket.send("S" + topic);
                        } catch (err) {
                            console.error("Failed to send subscribe for", topic, err);
                            // В случае ошибки можно ре-энкью или логировать — не ломаем цикл
                        }
                    }
                    newLocalSubs.set(topic, count + 1);
                    console.log(`Flushed SUBSCRIBE: ${topic}`);
                } else { // unsubscribe
                    const count = newLocalSubs.get(topic) || 0;
                    if (count <= 1) {
                        // Если было 0/1 — по факту подписка уйдёт в 0, нужно отправить U (если count was 1)
                        if (count === 1) {
                            try {
                                socket.send("U" + topic);
                            } catch (err) {
                                console.error("Failed to send unsubscribe for", topic, err);
                            }
                            newLocalSubs.delete(topic);
                        } else {
                            // count === 0: у нас нет подписки — игнорируем (может быть двойное un/sub race)
                        }
                    } else {
                        // count >= 2 -> уменьшаем счетчик, не дергаем сервер
                        newLocalSubs.set(topic, count - 1);
                    }
                    console.log(`Flushed UNSUBSCRIBE: ${topic}`);
                }
            }

            // Атомарно сохраняем обновлённую Map
            set({ localSubscriptions: newLocalSubs });
        },
        addCountCopiesOfHook: () => {
            set((state) => ({ countCopiesOfHook: state.countCopiesOfHook + 1 }));
        },
        reduceCountCopiesOfHook: () => {
            set((state) => ({ countCopiesOfHook: Math.max(0, state.countCopiesOfHook - 1) }));
        }
    };
});


export function useSocket() {
    const { state, accessToken } = useIdentity();

    const socket = useSocketStore((state) => state.socket);
    const setSocket = useSocketStore((state) => state.setSocket);
    const localSubscriptions = useSocketStore((state) => state.localSubscriptions);
    const subscribe = useSocketStore((state) => state.subscribe);
    const unsubscribe = useSocketStore((state) => state.unsubscribe);
    const isOpen = useSocketStore((state) => state.isOpen);
    const setOpen = useSocketStore((state) => state.setOpen);
    const flushActions = useSocketStore((state) => state.flushActions);
    const addCountCopiesOfHook = useSocketStore((state) => state.addCountCopiesOfHook);
    const reduceCountCopiesOfHook = useSocketStore((state) => state.reduceCountCopiesOfHook);

    useEffect(() => {
        addCountCopiesOfHook();
        return () => {
            reduceCountCopiesOfHook();
            const currentCount = useSocketStore.getState().countCopiesOfHook;
            if (currentCount <= 0) {
                const currentSocket = useSocketStore.getState().socket;
                currentSocket?.close();
            }
        }
    }, []);

    useEffect(() => {
        if (useSocketStore.getState().socket && useSocketStore.getState().socket?.readyState === WebSocket.OPEN) {
            return; // сокет уже открыт, ничего не делаем
        }
        if (state === "unknown") return; // <-- просто ждём
        if (state !== "authenticated") {
            // при логауте закрываем соединение
            console.log("Closing WebSocket due to unauthenticated state");
            if (socket) {
                socket.close();
                setSocket(null);
            }
            return;
        }

        if (!accessToken) {
            console.warn("Токена еще нет, не открываем пока сокет, ждем.");
            return;
        }

        if (useSocketStore.getState().waitSocketOpen) {
            console.log("Waiting for WebSocket to open...");
            return;
        }
        useSocketStore.getState().setWaitSocketOpen(true);

        const newSocket = new WebSocket(`wss://socket.mars-ssn.ru/ws?token=${accessToken}`);
        newSocket.onopen = () => {
            console.log("WebSocket connected");
            setOpen(true);
            flushActions();
        };
        newSocket.onclose = () => {
            console.log("WebSocket closed");
            setOpen(false);
            setSocket(null);
        };
        newSocket.onmessage = (event) => {
            handleMessage(event.data);
        };
        newSocket.onerror = (error) => {
            useSocketStore.getState().setWaitSocketOpen(false);
            console.error("WebSocket error:", error);
        };

        setSocket(newSocket);

    }, [state, accessToken, setSocket, setOpen]);

    const close = useCallback(() => {
        socket?.close();
        setSocket(null);
    }, [socket]);

    return {
        socket,
        localSubscriptions,
        subscribe,
        unsubscribe,
        isOpen,
        close
    };
}


function handleMessage(raw: string): void {
    console.log("RAW:", raw);

    let data: any;
    try {
        data = JSON.parse(raw);
    } catch (e) {
        console.error("Ошибка парсинга JSON:", raw, e);
        return;
    }

    console.log("AFTER PARSE:", data, "type:", typeof data);

    if (!data.type) {
        console.error("Received message without type: ", data);
        return;
    }
    switch (data.type as string) {
        case "status":
            handleStatusUpdate(data as StatusUpdateDto);
            break;
        case "user_update":
            handleUserUpdate(data.data as UserUpdateDto);
            break;
        default:
            console.error("Received message with unknown type: ", data);
            break;            
    }
}


interface StatusUpdateDto {
    type: "status";
    session: string;
    online: boolean;
    userId: number;
};

function handleStatusUpdate(data: StatusUpdateDto): void {
    if (!data) {
        console.error("Received empty status update");
        return;
    }
    if (data.type !== "status") {
        console.error("Received unexpected status update type:", data.type);
        return;
    }
    if (!data.session) {
        console.error("session field missing");
        return;
    }
    if (data.userId === undefined || data.userId === null || data.userId < 0) {
        console.error("Field 'userId' is missing or invalid");
        return;
    }

    console.log("Status update received: ", data);

    if (data.online)
        useUserStatusesStore.getState().addOnlineSession(data.userId, data.session);
    else
        useUserStatusesStore.getState().removeOnlineSession(data.userId, data.session);
}

interface UserUpdateDto {
    id: number;
    version: number;
    username: string;
    is_enabled: boolean; //Чуть позже
    small_avatar: number;
    large_avatar: number;
    fullscreen_avatar: number;
}

function handleUserUpdate(data: UserUpdateDto) {
    updateUser({
        id: data.id,
        version: data.version,
        username: data.username,
        smallAvatarId: data.small_avatar,
        largeAvatarId: data.large_avatar,
        fullscreenAvatarId: data.fullscreen_avatar
    });
}