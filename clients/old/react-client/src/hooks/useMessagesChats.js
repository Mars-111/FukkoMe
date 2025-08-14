import { useEffect, useState, useRef } from 'react';
import { getMessagesByChat } from '../services/api';
import keycloak from '../keycloak';

export default function useInitMessagesChats(chats, loadingChats, setErrors) {
    const [messages, setMessages] = useState(new Map()); // Теперь messages — Map
    const loadingMessagesRef = useRef(true); 

    useEffect(() => {
        if (loadingChats) return;

        chats.forEach(chat => {
            if (!chat.isNew && !messages.has(chat.id)) {
                (async () => {
                    try {
                        const chatMessages = await getMessagesByChat(chat.id, keycloak.token);
                        if (!Array.isArray(chatMessages)) {
                            throw new Error("Полученные сообщения не являются массивом");
                        }
                        console.log("Полученные сообщения для чата:", chatMessages);
                        setMessages(prev => {
                            const newMessages = new Map(prev); // Клонируем, так как Map мутируемый
                            newMessages.set(chat.id, chatMessages);
                            return newMessages;
                        });
                        loadingMessagesRef.current = false;
                    } catch (e) {
                        console.error("Ошибка получения сообщений чата:", e);
                        setErrors(prev => [...prev, "Ошибка получения сообщений чата"]);
                    }
                })();
            }
        });
    }, [chats, messages, setErrors]);




    const loadingMessages = loadingMessagesRef.current;
    return [messages, setMessages, loadingMessages.current];
}
