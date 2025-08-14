import React from "react";
import Message from "./Message";
import { formatDateLabel } from "./../services/timeUtils";

export default function MessageList({ messages, onEdit, onDelete, onReply, onForward }) {
    let lastDateLabel = null;

    return (
        <div>
            {messages.map((message, index) => {
                if (message.flags & 2) {return null;} // Пропускаем удаленные сообщения
                const currentLabel = formatDateLabel(message.timestamp);
                const showDateLabel = currentLabel !== lastDateLabel;
                lastDateLabel = currentLabel;

                return (
                    <div key={message.id || index}>
                        {showDateLabel && (
                            <div className="date-label">
                                {currentLabel}
                            </div>
                        )}
                        <Message
                            message={message}
                            onEdit={(chatId, messageId, messageEditDTO) => onEdit(chatId, messageId, messageEditDTO)}
                            onDelete={(chatId, messageId) => onDelete(chatId, messageId)}
                            onReply={(message) => onReply?.(message)}
                            onForward={(message) => onForward?.(message)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
