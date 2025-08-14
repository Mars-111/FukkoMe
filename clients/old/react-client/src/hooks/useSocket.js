import { useEffect, useRef, useState } from 'react';
import keycloak from '../keycloak'; // Импортируйте ваш экземпляр Keycloak

const RECONNECT_INTERVAL = 3000; // 3 секунды между попытками

export default function useInitSocket(addMessage, editMessage, deleteMessage, selectedChat, chats) {
    const socketClient = useRef(null);
    const reconnectTimer = useRef(null);
    const alreadySubscribedPrivateChat = useRef(new Set());

    function connect() {
        console.log("Инициализация WebSocket-клиента...");

        const socket = new WebSocket(`wss://socket.mars-ssn.ru/ws?token=${keycloak.token}`);

        socket.onopen = () => {
            console.log("WebSocket соединение установлено");
            clearTimeout(reconnectTimer.current);
        };

        socket.onclose = (event) => {
            console.log("WebSocket соединение закрыто:", event);
            attemptReconnect();
        };

        socket.onerror = (error) => {
            console.error("Ошибка WebSocket:", error);
            socket.close(); // Закрываем явно, чтобы сработал onclose и запустился reconnect
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (e) {
                console.error("Ошибка парсинга сообщения:", e, event.data);
            }
        };

        socketClient.current = socket;
    }

    function handleMessage(message) {
        console.log("---------------------------------------------");
        console.log("Получено сообщение:", message);
        console.log("---------------------------------------------");
        if (message.type === "text") {
            console.log("Получено текстовое сообщение: ", message);
            addMessage(message);
        }
        else if (message.type === "change message") {
            console.log("Получено событие редактирования сообщения из сокета: ", message);
            //{"changes": [{"field": "content", "new_value": "Привет", "old_value": "sdassasda"}], "message_id": 225}
            const chatId = Number(message.chat_id);
            const messageId = Number(message.data.message_id);
            const changes = message.data.changes;
            for (const change of changes) {
                if (change.field === "content") {
                    const newValue = change.new_value;
                    // const oldValue = change.old_value; //Не интересно
                    const messageEditDTO = { content: newValue };
                    editMessage(chatId, messageId, messageEditDTO);
                }
            }
        }
        else if (message.type  === "delete message") {
            console.log("получино событие удаления сообщения из сокета: ", message);
            const chatId = Number(message.chat_id);
            const data = message.data;
            const messageId = Number(data.message_id);
            deleteMessage(chatId, messageId);
        }
    }

    function attemptReconnect() {
        if (reconnectTimer.current) return; // Уже запланировано

        console.log(`Попытка переподключения через ${RECONNECT_INTERVAL / 1000}с...`);
        reconnectTimer.current = setTimeout(() => {
            reconnectTimer.current = null;
            connect();
        }, RECONNECT_INTERVAL);
    }

    useEffect(() => {
            if (!selectedChat) { return; }
            const isPrivate = selectedChat.type === "PRIVATE";
            if (!isPrivate) {
                subscribeGlobalToChat(selectedChat.id);
            }
            
            return () => {
                if (!isPrivate) {
                    unsubscribeGlobalFromChat(selectedChat.id);
                }
            }
    }, [selectedChat]);


    useEffect(() => {
        const privateChatIds = new Set(
            chats.filter(chat => chat.type === 'PRIVATE').map(chat => chat.id)
        );

        // Подписываемся на новые чаты
        privateChatIds.forEach(chatId => {
            if (!alreadySubscribedPrivateChat.current.has(chatId)) {
                console.log("Подписываемся на приватный чат с id: " + chatId);
                subscribeGlobalToChat(chatId);
                alreadySubscribedPrivateChat.current.add(chatId);
            }
        });

        // Отписываемся от чатов, которых больше нет
        alreadySubscribedPrivateChat.current.forEach(chatId => {
            if (!privateChatIds.has(chatId)) {
                console.log("Отписываемся от приватного чата с id: ", chatId);
                unsubscribeGlobalFromChat(chatId);
                alreadySubscribedPrivateChat.current.delete(chatId);
            }
        });

    }, [chats]);



    function subscribeGlobalToChat(chatId) {
        if (socketClient.current && socketClient.current.readyState === WebSocket.OPEN) {
            socketClient.current.send("G" + chatId);
            console.log("Глобальная подписка на чат:", chatId);
        } else {
            console.warn("Попытка подписки, но WebSocket ещё не открыт");
        }
    }
    
    function unsubscribeGlobalFromChat(chatId) {
        if (socketClient.current && socketClient.current.readyState === WebSocket.OPEN) {
            socketClient.current.send("UG" + chatId);
            console.log("Глобальная отписка от чата:", chatId);
        } else {
            console.warn("Попытка отписки, но WebSocket ещё не открыт");
        }
    }
    

    useEffect(() => {
        connect();

        return () => {
            if (socketClient.current) {
                socketClient.current.close();
            }
            clearTimeout(reconnectTimer.current);
        };
    }, []);

    return [socketClient, subscribeGlobalToChat, unsubscribeGlobalFromChat];
}
