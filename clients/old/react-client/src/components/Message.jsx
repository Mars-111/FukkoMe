import React, { useState, useRef, useEffect } from "react";
import { formatTime } from "../services/timeUtils";
import File from "./File";
import "./Message.css";

export default function Message({ message, onDelete, onEdit, onReply, onForward }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(message.content);

    const menuRef = useRef(null);

    const handleEdit = () => {
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const handleSaveEdit = () => {
        if (editedText.trim() !== "") {
            const messageEditDTO = { content: editedText };
            onEdit(message.chat_id, message.id, messageEditDTO);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        onDelete(message.chat_id, message.id);
        setIsMenuOpen(false);
    };

    const handleReply = () => {
        onReply?.(message);
        setIsMenuOpen(false);
    };

    const handleForward = () => {
        onForward?.(message);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="message-container">
            <div className="message-content">

                {/* Отображение пересланного сообщения */}
                {message.forwarded_from && (
                    <div className="forwarded-box">
                        <span className="forwarded-label">Переслано от {message.forwarded_from?.sender_id || "неизвестно"}</span>
                        <div className="forwarded-content">
                            {message.forwarded_from?.content || "Медиа"}
                        </div>
                    </div>
                )}

                {/* Ответ */}
                {message.reply_to && (
                    <div className="reply-box">
                        <div className="reply-line" />
                        <div className="reply-content">
                            <span className="reply-author">{message.reply_to?.sender_id || "неизвестно"}</span>
                            <div className="reply-text">{message.reply_to?.content || "Медиа"}</div>
                        </div>
                    </div>
                )}

                {/* Файлы */}
                {message.files?.map((file, index) => (
                    <File key={index} file={file} />
                ))}


                {/* Контент */}
                {isEditing ? (
                    <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveEdit();
                            }
                        }}
                        autoFocus
                        className="edit-input"
                    />
                ) : (
                    <>
                        <strong>{message.sender_id || message.senderId || "Неизвестно"}: </strong>
                        <span className="message-text">{message.content}</span>
                    </>
                )}
            </div>

            <div className="timestamp">{formatTime(message.timestamp)}</div>

            <div style={{ display: "flex", alignItems: "center", position: "relative" }} ref={menuRef}>
                <div className="message-menu-icon" onClick={() => setIsMenuOpen((prev) => !prev)}>
                    &#8226;&#8226;&#8226;
                </div>

                {isMenuOpen && (
                    <div className="message-menu">
                        <button onClick={handleReply}>💬 Ответить</button>
                        <button onClick={handleForward}>📤 Переслать</button>
                        <button onClick={handleEdit}>✏ Изменить</button>
                        <button onClick={handleDelete}>❌ Удалить</button>
                    </div>
                )}
            </div>
        </div>
    );
}
