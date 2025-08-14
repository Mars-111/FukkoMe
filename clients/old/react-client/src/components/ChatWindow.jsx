import { useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { useAppContext } from '../AppContext';
import Pending from './Pending';
import { sendMessage, editMessageApi, deleteMessageApi } from '../services/api';
import MessageList from './MessageList';
import './ChatWindow.css';
import FilePreviewList from './MediaPreviewList';


function ChatWindow() {
    const { messages, addMessage, editMessage, getMessage, deleteMessage, chats, selectedChat, getPendingList, addPending, retryPending, removePending, pendingVersion, getSelectedFiles, clearSelectedFiles } = useAppContext();
    const chat = chats.find((c) => c.id === selectedChat.id);
    const chatMessages = messages.get(selectedChat.id) || [];
    const messagesEndRef = useRef(null);

    const [replyTo, setReplyTo] = useState(null);
    const [forwardedFrom, setForwardedFrom] = useState(null);


    useEffect(() => {
        if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, pendingVersion]); // следим и за pending тоже!


    const handleReply = (message) => {
        setReplyTo(message);
        setForwardedFrom(null); // чтобы не было одновременно
    };

    const handleForward = (message) => {
        setForwardedFrom(message);
        setReplyTo(null);
    };

    function handleSendMessage(text) {
        console.log("handleSendMessage: ", text);
        const message = {
            content: text,
            type: 'text',
            chat_id: selectedChat.id
        };
        const messageForPending = {
            content: text,
            type: 'text',
            chat_id: selectedChat.id,
            files: getSelectedFiles()
        };
        if (replyTo) {
            message.reply_to = replyTo.id;
        }
        if (forwardedFrom) {
            message.forwarded_from = forwardedFrom.id;
        }
        console.log("message: ", message);
        const pendingItem = addPending(selectedChat.id, messageForPending);
        retryPending(selectedChat.id, pendingItem.tempId, () => {
            console.log("retryPending");
            return sendMessage(message, getSelectedFiles(), addMessage);
        });
        setReplyTo(null); // сбрасываем ответ
        setForwardedFrom(null); // сбрасываем пересланное сообщение
        clearSelectedFiles(); // очищаем выбранные файлы
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
            <h3>{chat.name}</h3>
            <div style={{ fontSize: '0.9em', color: '#888' }}>
                Скоро появится дополнительная информация (профиль, настройки и т.д.).
            </div>
        </div>

        {/* Лента сообщений */}
        <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
            {/* {chatMessages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '10px' }}>
                <Message message={msg} />
            </div>
            ))} */}
            <MessageList messages={chatMessages} 
            onEdit={(chatId, messageId, messageEditDTO) => {
            editMessageApi(chatId, messageId, messageEditDTO, editMessage, getMessage);
            }} 
            onDelete={(chatId, messageId) => {
            deleteMessageApi(chatId, messageId, getMessage, addMessage, deleteMessage);
            }}
            onReply={handleReply}
            onForward={handleForward}
            />
            {getPendingList(selectedChat.id).map((item) => (
            <div key={item.tempId} style={{ marginBottom: '10px' }}>
                {item.type === "text" && (
                <Pending
                    key={item.tempId}
                    message={item}
                    failed={item.failed}
                    onRetry={() => retryPending(selectedChat.id, item.tempId, () => {
                        console.log("retryPending");
                        return sendMessage(item, addMessage);
                    })}
                    onDelete={() => removePending(selectedChat.id, item.tempId)}
                />
                )}
            </div>
            ))}

            {/* Элемент для прокрутки вниз */}
            <div ref={messagesEndRef} />
        </div>

        {/* Ввод сообщения */}
        {(replyTo || forwardedFrom) && (
            <div className="reply-forward-banner">
                <div className="banner-content">
                    <strong>
                        {replyTo ? `Ответ ${replyTo.sender_id || "пользователю"}` : `Переслано от ${forwardedFrom.sender_id || "пользователя"}`}
                    </strong>
                    <div className="original-text">
                        {(replyTo || forwardedFrom).content?.slice(0, 100)}
                    </div>
                </div>
                <button onClick={() => { setReplyTo(null); setForwardedFrom(null); }}>×</button>
            </div>
        )}
        <div style={{ borderTop: '1px solid #ddd', padding: '10px' }}>
            <FilePreviewList />
            <MessageInput onSend={handleSendMessage} />
        </div>
        </div>
    );
}

export default ChatWindow;
