import { useState } from "react";
import { useIdentity } from "../../auth/hooks/useIdentity";
import type { Chat, ChatType } from "../models/chat";
import { createChatRequest, type CreateChatRequestBody } from "../internal/api/chatsApi";
import { createChat, getChatsByLikeName, getChatsByLikeTag, getMyChats } from "../utils/ChatUtils";


export function TestChatsPage() {
    const { accessToken } = useIdentity();
    const [createResponse, setCreateResponse] = useState<Chat | null>(null);
    const [findChatsResponse, setFindChatsResponse] = useState<Chat[]>([]);

    return (
        <div>
            <h1>Test Chats Page</h1>
            <div className="create">
                <form onSubmit={(event) => handleCreateChat(event, accessToken, setCreateResponse)}>
                    <h2>Create Chat</h2>
                    <input type="text" name="name" placeholder="name" required />
                    <input type="text" name="tag" placeholder="tag" required />
                    <textarea name="description" placeholder="description" />
                    <select name="type" required>
                        <option value="PUBLIC_GROUP">Public group</option>
                        <option value="PRIVATE_GROUP">Private group</option>
                    </select>
                    <button type="submit">Create Chat</button>
                </form>
            </div>
            <div className="create-response">
                {createResponse && (
                    <div>
                        <h3>Created Chat:</h3>
                        <p>id: {createResponse.id}</p>
                        <p>name: {createResponse.name}</p>
                        <p>tag: {createResponse.tag}</p>
                        <p>description: {createResponse.description}</p>
                        <p>type: {createResponse.type}</p>
                        <p>small avatar id: {createResponse.smallAvatarId}</p>
                        <p>large avatar id: {createResponse.largeAvatarId}</p>
                        <p>fullscreen avatar id: {createResponse.fullscreenAvatarId}</p>
                    </div>
                ) || <p>No chat created yet.</p>}
            </div>
            <div className="find-chats">
                <form onSubmit={(event) => handleFindChats(event, setFindChatsResponse)}>
                    <h2>Find Chats by Tag</h2>
                    <input type="text" name="name" placeholder="tag" required />
                    <button type="submit">Find Chats</button>
                </form>
                <div className="find-response">
                    {findChatsResponse.length > 0 ? (
                        <ul>
                            {findChatsResponse.map((chat) => (
                                <li key={chat.id}>Chat ID: {chat.id}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No chats found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

async function handleCreateChat(event: React.FormEvent<HTMLFormElement>, accessToken: string | null, setCreateResponse: React.Dispatch<React.SetStateAction<Chat | null>>) {
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
        setCreateResponse(createdChat);
    } catch (error) {
        console.error("Error creating chat:", error);
        setCreateResponse(null);
    }
}

async function handleFindChats(event: React.FormEvent<HTMLFormElement>, setChatsResponce: React.Dispatch<React.SetStateAction<Chat[]>>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    if (!formData.get("name")) return;
    const name: string = formData.get("name") as string;

    let responceChats: Chat[] = [];

    try {
        const chatsByTag: Promise<Chat[]> = getChatsByLikeTag(name, 10);
        const chatsByName: Promise<Chat[]> = getChatsByLikeName(name, 10);
        console.log("Finding chats by tag: ", (await chatsByTag).length);
        console.log("Finding chats by name: ", (await chatsByName).length);
        responceChats = (await chatsByTag).concat(await chatsByName);
        console.log("Found chats: ", responceChats.length);
    } catch (error) {
        console.error("Error finding chats:", error);
        responceChats = [];
    }

    setChatsResponce(responceChats);
}