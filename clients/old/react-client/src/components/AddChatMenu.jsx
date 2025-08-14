import React, { useState } from "react";
import { useAppContext } from '../AppContext';
import { joinChat, createJoinRequestToChat, getChatByTag } from "../services/api";
import keycloak from "../keycloak";

import "./AddChatMenu.css";

function AddChatMenu() {
  const { setIsAddChatVisible } = useAppContext();
  const [chatTag, setChatTag] = useState("");
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchChat = async () => {
    if (!chatTag.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const chat = await getChatByTag(chatTag, keycloak.token);
      setChatInfo(chat);
    } catch (err) {
      setError("Чат не найден");
      setChatInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChat = async () => {
    if (!chatInfo) return;
    setLoading(true);

    try {
      if (chatInfo.private) {
        createJoinRequestToChat(chat.id, keycloak.token)
        alert("Запрос на вступление отправлен!");
      } else {
        await joinChat(chatInfo.id, keycloak.token);
        alert("Вы успешно вступили в чат!");
      }
      setIsAddChatVisible(false);
    } catch (err) {
      setError("Ошибка при вступлении в чат");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-chat-modal">
      <div className="modal-content">
        <h2>Добавить чат</h2>
        <input
          type="text"
          placeholder="Введите тег чата..."
          value={chatTag}
          onChange={(e) => setChatTag(e.target.value)}
        />
        <button onClick={handleSearchChat} disabled={loading}>
          {loading ? "Поиск..." : "Найти"}
        </button>

        {error && <p className="error">{error}</p>}

        {chatInfo && (
          <div className="chat-preview">
            <h3>{chatInfo.name}</h3>
            <p>ID: {chatInfo.id}</p>
            <p>Тег: {chatInfo.tag}</p>
            <p>{chatInfo.private ? "🔒 Приватный чат" : "🌍 Открытый чат"}</p>
            <p>Владелец: {chatInfo.owner_id}</p>
            <button onClick={handleJoinChat} disabled={loading}>
              {chatInfo.private ? "Запросить вступление" : "Вступить"}
            </button>
          </div>
        )}

        <button className="cancel" onClick={() => setIsAddChatVisible(false)}>
          Отмена
        </button>
      </div>
    </div>
  );
}

export default AddChatMenu;
