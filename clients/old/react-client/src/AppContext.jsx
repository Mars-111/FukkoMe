import React, { createContext, useContext, useEffect, useState } from 'react';

import useInitChats from './hooks/useChats';
import useInitMessagesChats from './hooks/useMessagesChats';
import useInitSocket from './hooks/useSocket';
import { usePending } from './hooks/usePendingMessages';
import useInitFile from './hooks/useFile';
import { createChatApi } from './services/api';
import { initDB } from './idb';
import useInitUser from './hooks/useUser';

// Создаём глобальный контекст для всех хуков
const AppContext = createContext();

// Провайдер, который оборачивает всё приложение и предоставляет доступ к состоянию
function AppProvider({ children }) {
    useEffect(() => {
        initDB();
        console.log("IndexedDB инициализирован");
    }, []);

    const [errors, setErrors] = useState([]);
    function addError(error) {
        setErrors(prev => [...prev, error]);
    }
    const [chats, setChats, loadingChats] = useInitChats(addError);
    const [messages, setMessages] = useInitMessagesChats(chats, loadingChats, setErrors);
    const [selectedChat, setSelectedChat] = useState(null);

    function getMessage(chatId, messageId) {
        const chatMessages = messages.get(chatId) || [];
        return chatMessages.find(m => m.id === messageId);
    }

    function addMessage(message) {
        const chatId = Number(message.chat_id);
        message.id = Number(message.id); // Привязываем id к сообщению
        setMessages(prev => {
            const prevMessages = prev.get(chatId) || [];
            console.log("prevMessages: ", prevMessages);
            const alreadyExists = prevMessages.some(m => m.id === message.id );
            if (alreadyExists) {
                console.log("Дубликат сообщения, не добавляем:", message);
                return prev; // Никаких изменений
            }
            const updated = new Map(prev);
            updated.set(chatId, [...prevMessages, message]);
            return updated;
        });
    }

    function editMessage(chatId, messageId, messageEditDTO) {
        setMessages(prev => {
            const chatMessages = prev.get(chatId) || [];
            const updatedMessages = chatMessages.map(message => 
                message.id === messageId 
                    ? { ...message, content: messageEditDTO.content, flags: message.flags | 1 } 
                    : message
            );
            const updated = new Map(prev);
            updated.set(chatId, updatedMessages);
            return updated;
        });
    }

    function deleteMessage(chatId, messageId) {
        setMessages(prev => {
            const chatMessages = prev.get(chatId) || [];
            const updatedMessages = chatMessages.map(message => 
                message.id === messageId 
                    ? { ...message, flags: message.flags | 2 } // Set the "deleted" flag (bit 1)
                    : message
                );
                const updated = new Map(prev);
                updated.set(chatId, updatedMessages);
                return updated;
        }); 
    }
    const [socketRef, subscribeGlobalToChat, unsubscribeGlobalFromChat] = useInitSocket(addMessage, editMessage, deleteMessage, selectedChat, chats);

    
    async function createChat(name, tag, type) {
        const chatDTO = {
            name: name,
            tag: tag,
            type: type
        };

        const responce = await createChatApi(chatDTO);
        
        const createdChat = {
            id: responce.id || -1,
            name: responce.name || '',
            tag: responce.tag || '',
            type: responce.type || '',
            owner_id: responce.owner_id || -1,
            isNew: true
        };

        if (createdChat.id === -1 || createdChat.name === '', createdChat.tag === '' || createdChat.type === '' || createdChat.owner_id === -1) {
            console.error("Какая-то ошибка при созаднии чата (одно из полей отсутсвует): ", createdChat);
            throw Error("Какая-то ошибка при созаднии чата (одно из полей отсутсвует): ", createdChat)
        }

        setChats(prev => [...prev, createdChat]);
    }



    const { getPendingList, addPending, removePending, markFailed, retryPending, pendingVersion } = usePending();
      
    const [isAddChatVisible, setIsAddChatVisible] = useState(false);

    const {getSelectedFiles, addSelectedFiles, removeSelectedFile, clearSelectedFiles, getFile, saveFile} = useInitFile();

    const { user } = useInitUser();

    return (
        <AppContext.Provider
            value={{
                chats, setChats, createChat,
                errors, addError,
                messages, setMessages, addMessage, editMessage, deleteMessage, getMessage,
                socketRef,
                selectedChat, setSelectedChat,
                isAddChatVisible, setIsAddChatVisible,
                getPendingList, addPending, removePending, markFailed, retryPending, pendingVersion,
                getSelectedFiles, addSelectedFiles, removeSelectedFile, clearSelectedFiles,
                getFile, saveFile,
                user
            }}
        >
            {children}
        </AppContext.Provider>
    );
}



function useAppContext() {
    return useContext(AppContext);
}

export {AppProvider, useAppContext};