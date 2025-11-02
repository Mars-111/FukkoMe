import type { Axios } from "axios";
import axios from "axios";
import { objectToChat, type Chat, type ChatType } from "../../models/chat";

const axiosChats: Axios = axios.create({
    baseURL: "https://chats.mars-ssn.ru",
    withCredentials: true
});

axiosChats.interceptors.response.use(
    (response) => {
        console.log('Успешный запрос');
        return response;
    },
    (error) => {
        console.error('Ошибка при запросе:', error);
        if (error.response) {
            const status = error.response.status;
            console.error(`Ошибка при запросе к ${error.response.url} c кодом ${status}`);
        } else if (error.request) {
            console.error(`Сервер не ответил (возможно CORS или отключение сервера). Url: ${error.request.url}`);
        } else {
            console.error('Произошла ошибка при настройке запроса:', error.message);
        }
        return Promise.reject(error);
    }
);



export interface CreateChatRequestBody {
    tag: string;
    type: ChatType;
    name: string;
    description?: string;
}
export async function createChatRequest(data: CreateChatRequestBody, authToken: string): Promise<Chat> {
    const response = await axiosChats.post("/api/chats", data, {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });
    return objectToChat(response.data);
}

export async function getChatByIdRequest(chatId: number): Promise<Chat> {
    const response = await axiosChats.get(`/api/chats/${chatId}`);
    return objectToChat(response.data);
}

export async function getChatByTagRequest(tag: string): Promise<Chat> {
    const response = await axiosChats.get(`/api/chats/tag/${tag}`);
    return objectToChat(response.data);
}

export async function getChatByLikeTagRequest(tag: string, limit: number): Promise<Chat[]> {
    const response = await axiosChats.get(`/api/chats/like/tag/${tag}?limit=${limit}`);
    return response.data.map((obj: any) => objectToChat(obj));
}

export async function getChatByLikeNameRequest(name: string, limit: number): Promise<Chat[]> {
    const response = await axiosChats.get(`/api/chats/like/name/${name}?limit=${limit}`);
    return response.data.map((obj: any) => objectToChat(obj));
}

export async function getMyChatIdsRequest(authToken: string): Promise<number[]> {
    const response = await axiosChats.get(`/api/chats/me/chats`, {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });
    return response.data;
}
