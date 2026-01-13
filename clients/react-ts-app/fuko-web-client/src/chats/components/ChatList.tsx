import { useNavigate } from "react-router-dom";
import { ChatCell, EntityCell } from "../../general/components/EntitiesCells";
import type { Chat } from "../models/chat";


export function StaticChatList({ chats }: { chats: Chat[] }) {
    const navigate = useNavigate();
    
    return (
        <div className="chat-list">
            {
                chats.map((chat) => (
                    <EntityCell name={chat.name} 
                                avatarId={chat.smallAvatarId} 
                                onClick={() => navigate(`/app/chat/${chat.id}`)} 
                                avatarSize="small"
                    />
                ))
            }
        </div>
    )
}

export function DynamicChatList({ chatIds, selectedChatId, onClickChat }: { chatIds: number[], selectedChatId?: number, onClickChat: (chatId: number) => void }) {
    const navigate = useNavigate();

    return (
        <div className="chat-list">
            {
                chatIds.map((chatId) => (
                    <ChatCell id={chatId} onClick={() => onClickChat(chatId)} key={chatId} avatarSize="small-medium" selected={selectedChatId === chatId} circle />
                ))
            }
        </div>
    )
}

export function FromDbChatList({ chatIds }: { chatIds: number[] }) {
    
}
