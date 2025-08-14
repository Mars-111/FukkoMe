import React, { useState } from 'react';
import './Message.css';

export default function Pending({ message, failed, onRetry, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="message-container" style={{ background: failed ? '#ffe6e6' : '#f9f9f9' }}>
      <div className="message-content">
        <strong>{message.sender_id || message.senderId || 'Неизвестно'}: </strong>
        <span>{message.content}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {failed ? (
          <span className="not-delivered-icon" title="Ошибка при отправке">❗</span>
        ) : (
          <span title="Отправляется" style={{ fontSize: '1.1em', color: '#999' }}>⏳</span>
        )}

        <div className="message-menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          &#8226;&#8226;&#8226;
        </div>
      </div>

      {isMenuOpen && (
        <div className="message-menu">
          {failed && <button onClick={onRetry}>🔄 Повторить</button>}
          <button onClick={onDelete}>❌ Удалить</button>
        </div>
      )}
    </div>
  );
}
