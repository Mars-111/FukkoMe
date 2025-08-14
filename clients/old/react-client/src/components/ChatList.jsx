import React from 'react';
import { joinChat } from '../services/api';
import { useAppContext } from '../AppContext';
import keycloak from '../keycloak';

function ChatList() {
	const {chats, messages} =  useAppContext();
	const {selectedChat, setSelectedChat} = useAppContext();
	const {setErrors} = useAppContext();

	console.log("chats: ", chats);

	const handleJoinChat = async (chat) => {
		try {
			await joinChat(chat.id, keycloak.token);
		} catch (error) {
			console.error("Ошибка запроса на вступление в чат:", error);
			setErrors("Ошибка запроса на вступление в чат");
		}
	};

	return (
		<div>
		<h2>Чаты</h2>
		<ul style={{ listStyle: 'none', padding: 0 }}>
			{chats.map(chat => (
			<li 
				key={chat.id} 
				onClick={() => setSelectedChat(chat)}
				style={{
				padding: '10px',
				cursor: 'pointer',
				backgroundColor: selectedChat && selectedChat.id === chat.id ? '#eee' : 'transparent',
				borderBottom: '1px solid #ddd',
				position: 'relative'
				}}
			>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div>
					<div>{chat.name}</div>
					{(() => {
						const chatMessages = messages.get(chat.id) ?? [];

						if (chatMessages.length > 0) {
							const lastMessage = chatMessages[chatMessages.length - 1];
							return (
								<div style={{ fontSize: '0.8em', color: '#555' }}>
									{lastMessage.content.length > 10
										? lastMessage.content.slice(0, 20) + '...'
										: lastMessage.content}
								</div>
							);
						}

						return null;
					})()}
				</div>
				{chat.privateChat && !chat.joined && (
					<button onClick={(e) => { e.stopPropagation(); handleJoinChat(chat); }}>
					Запрос на вступление
					</button>
				)}
				</div>
			</li>
			))}
		</ul>
		</div>
	);
}

export default ChatList;
