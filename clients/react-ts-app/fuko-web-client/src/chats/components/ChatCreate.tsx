import { useEffect, useState } from "react";
import { useIdentity } from "../../auth/hooks/useIdentity";
import type { Chat, ChatType } from "../models/chat";
import type { CreateChatRequestBody } from "../internal/api/chatsApi";
import { createChat } from "../utils/ChatUtils";
import { useNavigate } from "react-router-dom";
import { useMessengerLayoutStore } from "../../layout/messengerLayoutStore";





export function ChatCreate() {
    const { accessToken } = useIdentity();
    const [createdChat, setCreatedChat] = useState<Chat | "create error" | "none">("none");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const navigate = useNavigate();
    const setSelectedLeftTabId = useMessengerLayoutStore((state) => state.leftPanel.setSelectedTabId);
    const setSelectedRightTabId = useMessengerLayoutStore((state) => state.rightPanel.setSelectedTabId);
    const deleteLeftTabNodeByName = useMessengerLayoutStore((state) => state.leftPanel.deleteTabNodeByName);

    useEffect(() => {
        if (createdChat === "none") return;
        if (createdChat === "create error") return;
        console.log("aaaaaaaaaaaaaaaaaaaaa");
        setSelectedLeftTabId("main");
        setSelectedRightTabId("main");
        deleteLeftTabNodeByName("create chat");
        navigate(`/app/chat/${createdChat.id}`, { replace: true });
    }, [createdChat]);

    return (
        <div className="chat-create-panel">
            <h2>Create a new chat</h2>
            <form onSubmit={(event) => handleCreateChat(event, accessToken, setCreatedChat, setErrorMessage)}>
                <input type="text" name="name" placeholder="name" required />
                <input type="text" name="tag" placeholder="tag" required />
                <textarea name="description" placeholder="description" />
                <select name="type" required>
                    <option value="PUBLIC_GROUP">Public group</option>
                    <option value="PRIVATE_GROUP">Private group</option>
                </select>
                <button type="submit">Create Chat</button>
            </form>
            {errorMessage && <p style={{color: "red"}}>{errorMessage}</p>}
            {errorMessage.length < 1 && createdChat === "create error" && <p style={{color: "red"}}>Неизвестная ошибка при создании</p>}
        </div>
    );
}


async function handleCreateChat(event: React.FormEvent<HTMLFormElement>, accessToken: string | null, setCreatedChat: React.Dispatch<React.SetStateAction<Chat | "create error" | "none">>, setErrorMessage?: React.Dispatch<React.SetStateAction<string>>) {
    event.preventDefault();

    if (!accessToken) {
        console.error("No access token available");
        return;
    }

    const formData = new FormData(event.currentTarget);
    const createChatRequestBody: CreateChatRequestBody = {
        name: formData.get("name") as string,
        tag: formData.get("tag") as string,
        description: formData.get("description") as string || undefined,
        type: formData.get("type") as ChatType
    };

    try {
        const createdChat = await createChat(createChatRequestBody, accessToken);
        console.log("Chat created:", createdChat);
        setCreatedChat(createdChat);
    } catch (error) {
        console.error("Error creating chat:", error);
        setCreatedChat("create error");
        setErrorMessage?.(error as string);
    }
}