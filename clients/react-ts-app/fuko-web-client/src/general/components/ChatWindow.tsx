import { useChatById } from "../../chats/hooks/useChatById"
import { ShimmerText } from "./ShimmerText";
import Modal from "react-modal";
import { useState } from "react";
import { ChatInfo } from "../../chats/components/ChatInfo";



export function ChatWindow({ chatId }: { chatId: number }) {
    const chat = useChatById(chatId);
    const [chatInfoModalIsOpen, setChatInfoModalIsOpen] = useState<boolean>(false);

    function onClickHeader() {
        setChatInfoModalIsOpen(true);
    }

    return (
        <>
            <div className="flex flex-col h-full border-r border-gray-300">
                <div className="p-4 text-lg font-semibold bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={onClickHeader}>
                    {chat ? chat.name : <ShimmerText width="12rem" height="1.5rem" rounded={false} />}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    Messages here
                </div>

                <div className="p-4 border-t border-gray-300">
                    input area here
                </div>
            </div>
            <Modal isOpen={chatInfoModalIsOpen} onRequestClose={() => setChatInfoModalIsOpen(false)} ariaHideApp={false}>
                <ChatInfo chatId={chatId} />    
            </Modal> 
        </>
    )
}