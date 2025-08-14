import { useState, useEffect, useRef } from 'react';
import { getUserChats } from '../services/api';
import keycloak from '../keycloak';
import { setChatsIDB } from '../idb';


export default function useInitChats(addError) {
    const [chats, setChats] = useState([]);
    const loadingChatsRef = useRef(true);

    // Загрузка списка чатов при монтировании
    useEffect(() => {
        async function fetchChats() {
            try {
                const data = await getUserChats(keycloak.token);
                setChatsIDB(data); // Сохраняем чаты в IndexedDB
                setChats(data);
                loadingChatsRef.current = false;
                console.log("Загруженные чаты:", data);
            } catch (err) {
                console.error("Ошибка загрузки чатов:", err);
                addError("Ошибка загрузки чатов (fetch)");
            }
        }
        fetchChats();
    }, []);

    const loadingChats = loadingChatsRef.current;

    return [ chats, setChats, loadingChats ];
}
