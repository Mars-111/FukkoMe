import React, { useState } from "react";
import "./CreateChatButton.css";

export default function CreateChatButton({ onCreate }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatName, setChatName] = useState("");
    const [chatTag, setChatTag] = useState("");
    const [chatType, setChatType] = useState("PUBLIC_GROUP"); // Можно установить значение по умолчанию как "PRIVATE"

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setChatName("");
        setChatTag("");
        setChatType("PRIVATE");
    };

    const handleCreate = () => {
        if (chatName.trim() && chatTag.trim() && chatType.trim()) {
            const newChat = {
                name: chatName.trim(),
                tag: chatTag.trim(),
                type: chatType.trim(),
            };
            console.log("handleCreate: ", newChat);
            onCreate(newChat.name, newChat.tag, newChat.type);
            handleCloseModal();
        }
    };

    return (
        <>
            <button className="create-chat-btn" onClick={handleOpenModal}>
                ➕ Создать чат
            </button>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Новый чат</h3>
                        <input
                            type="text"
                            placeholder="Введите название чата"
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                            className="chat-name-input"
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Введите тег чата"
                            value={chatTag}
                            onChange={(e) => setChatTag(e.target.value)}
                            className="chat-tag-input"
                        />
                        <select
                            value={chatType}
                            onChange={(e) => setChatType(e.target.value)}
                            className="chat-type-select"
                        >
                            <option value="PRIVATE">Приватный</option>
                            <option value="PRIVATE_GROUP">Приватная группа</option>
                            <option value="PUBLIC_GROUP">Публичная группа</option>
                            <option value="CHANNEL">Канал</option>
                        </select>
                        <div className="modal-actions">
                            <button onClick={handleCreate}>Создать</button>
                            <button onClick={handleCloseModal}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
