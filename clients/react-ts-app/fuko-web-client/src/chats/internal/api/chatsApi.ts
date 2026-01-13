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

export async function getChatVersionByIdRequest(chatId: number): Promise<number | null> {
    const responce = await axiosChats.get(`/api/chats/${chatId}/version`);
    return responce.data as (number | null);
}

export async function getChatByIdRequest(chatId: number): Promise<Chat> {
    const response = await axiosChats.get(`/api/chats/${chatId}`);
    return objectToChat(response.data);
}

export async function getChatByTagRequest(tag: string): Promise<Chat> {
    const response = await axiosChats.get(`/api/chats/tag/${tag}`);
    return objectToChat(response.data);
}

export async function getChatsByLikeTagRequest(tag: string, limit: number): Promise<Chat[]> {
    const response = await axiosChats.get(`/api/chats/like/tag/${tag}?limit=${limit}`);
    return response.data.map((obj: any) => objectToChat(obj));
}

export async function getChatsByLikeNameRequest(name: string, limit: number): Promise<Chat[]> {
    const response = await axiosChats.get(`/api/chats/like/name/${name}?limit=${limit}`);
    return response.data.map((obj: any) => objectToChat(obj));
}

export async function getMyChatsRequest(authToken: string): Promise<Chat[]> {
    const response = await axiosChats.get(`/api/chats/me/chats`, {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });
    return response.data.map((obj: any) => objectToChat(obj));

}

export interface UpdateMyChatAvatarBodyInterface { //Токены
    original: string;
    small: string;
    large: string;
    fullscreen: string;
}

export function updateMyChatAvatarRequest(chatId: number, updateAvatarBody: UpdateMyChatAvatarBodyInterface, authToken: string): Promise<Chat> {
    return axiosChats.put(`/api/chats/${chatId}/avatar`, updateAvatarBody, {
        headers: {
            "Authorization": "Bearer " + authToken
        }
    }).then(resp => {
        return objectToChat(resp.data);
    });
}

export interface UpdateMyChatBodyInterface { 
    name?: string;
    tag?: string;
    description?: string;
}

export function updateChatRequest(chatId: number, updateChatBody: UpdateMyChatBodyInterface, authToken: string): Promise<Chat> {
    return axiosChats.put(`/api/chats/${chatId}`, updateChatBody, {
        headers: {
            "Authorization": "Bearer " + authToken
        }
    }).then(resp => {
        return objectToChat(resp.data);
    });
}

export async function getChatMembersCountRequest(chatId: number): Promise<number | null> {
    const response = await axiosChats.get(`/api/chats/${chatId}/members/count`);
    const count: number | undefined = response.data as number;
    return count || null;
}

// export async function getChatTopRonkMembersRequest(chatId: number, limit: number): Promise<MemberRole[] | null> {
//     const response = await axiosChats.get(`/api/chats/${chatId}/members/top-ranked`);
//     const topRankUsers: { user_id: number; role_id: number }[] | undefined = response.data;

//     if (!topRankUsers) return null;

//     // Преобразуем в camelCase
//     return topRankUsers.map(u => ({
//         userId: u.user_id,
//         roleId: u.role_id
//     }));
// }

export async function getMembersRequest(chatId: number): Promise<Map<number, number>> { //key - userId, value - roleId
    const response = await axiosChats.get(
        `/api/chats/${chatId}/members?b=1`,
        { responseType: "arraybuffer" }
    );

    const buffer = new DataView(response.data);
    const result = new Map<number, number>();

    for (let offset = 0; offset < buffer.byteLength; offset += 16) {
        const userId = Number(buffer.getBigInt64(offset, false));       // big-endian
        const roleId = Number(buffer.getBigInt64(offset + 8, false));   // big-endian
        result.set(userId, roleId);
    }

    return result;
}

export async function joinToChatRequest(chatId: number, authToken: string): Promise<void> {
    return axiosChats.post(
        `/api/chats/${chatId}/join`,
        null, // тело отсутствует
        {
            headers: {
                "Authorization": "Bearer " + authToken
            }
        }
    );
}

export function exitChatRequest(chatId: number, authToken: string): Promise<void> {
    return axiosChats.post(
        `/api/chats/${chatId}/exit`,
        null, // тело отсутствует
        {
            headers: {
                "Authorization": "Bearer " + authToken
            }
        }
    );
}