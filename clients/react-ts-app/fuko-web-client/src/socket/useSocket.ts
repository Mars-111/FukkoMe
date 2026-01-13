import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { useIdentity } from "../auth/hooks/useIdentity";
import { messageHandleMap } from "./messageHandleMap";
import { objectToChatEvent } from "../chat-events/chatEvent";


export interface PendingEntity {
    type: "chat" | "user";
    id: number;
}

export interface PendingAction {
    type: "subscribe" | "unsubscribe";
    entity: PendingEntity;
}

interface SocketStore {
    socket: WebSocket | null;
    waitSocketOpen: boolean;
    isOpen: boolean,
    localSubscriptions: Map<PendingEntity, number>; //topic и сколько хуков подписанно
    pendingActions: PendingAction[];
    countCopiesOfHook: number;
    addCountCopiesOfHook: () => void;
    reduceCountCopiesOfHook: () => void;
    setWaitSocketOpen: (wait: boolean) => void;
    setSocket: (socket: WebSocket | null) => void;
    setOpen: (open: boolean) => void;
    subscribe: (entity: PendingEntity) => void;
    unsubscribe: (entity: PendingEntity) => void;
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
                if (pending[i].entity === action.entity && pending[i].type === oppositeType) {
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

    function entityToTopic(entity: PendingEntity): string {
        switch (entity.type) {
            case "chat":
                return `c:${entity.id}`;
            case "user":
                return `u:${entity.id}`;
            default:
                throw new Error(`Unknown entity type: ${entity.type}`);
        }
    }

    return {
        socket: null,
        isOpen: false,
        waitSocketOpen: false,
        setWaitSocketOpen: (wait: boolean) => {
            set({ waitSocketOpen: wait });
        },
        localSubscriptions: new Map<PendingEntity, number>(),
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
        subscribe: (entity: PendingEntity) => {
            pushAction({ type: "subscribe", entity: entity });
            setTimeout(() => get().flushActions(), 0); //Gpt сказал так сделать, что бы изежать гонки
        },
        unsubscribe: (entity: PendingEntity) => {
            pushAction({ type: "unsubscribe", entity: entity });
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

            try {
                for (const { type, entity } of toFlush) {
                    if (type === "subscribe") {
                        // Если ещё не подписаны на сервере (count === 0) — отправляем S
                        const count = newLocalSubs.get(entity) || 0;
                        if (count === 0) {
                            socket.send("S" + entityToTopic(entity));
                        }
                        newLocalSubs.set(entity, count + 1);
                        console.log(`Flushed SUBSCRIBE: ${entityToTopic(entity)}`);
                    } else { // unsubscribe
                        const count = newLocalSubs.get(entity) || 0;
                        if (count <= 1) {
                            // Если было 0/1 — по факту подписка уйдёт в 0, нужно отправить U (если count was 1)
                            if (count === 1) {
                                socket.send("U" + entityToTopic(entity));
                                newLocalSubs.delete(entity);
                            } else {
                                // count === 0: у нас нет подписки — игнорируем (может быть двойное un/sub race)
                            }
                        } else {
                            // count >= 2 -> уменьшаем счетчик, не дергаем сервер
                            newLocalSubs.set(entity, count - 1);
                        }
                        console.log(`Flushed UNSUBSCRIBE: ${entityToTopic(entity)}`);
                    }
                }
            } catch {
                // В случае ошибки при отправке — ре-энкью все действия обратно в очередь
                set((s) => ({ pendingActions: [...toFlush, ...s.pendingActions] }));
                console.error("Error sending WebSocket messages, re-queuing actions");
                return;
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
    let message: any;
    try {
        message = JSON.parse(raw);
    } catch (e) {
        console.error("Ошибка парсинга JSON:", raw, e);
        return;
    }

    console.log("Получено сообщение от сокета:", message, "type:", typeof message);

    if (!message.type) {
        console.error("Received message without type: ", message);
        return;
    }
    const handler = messageHandleMap.get(message.type);
    if (!handler) {
        console.error("No handler for message type:", message.type);
        return;
    }
    handler(message.data);
}