import type { Axios } from "axios";
import axios from "axios";

const axiosUser: Axios = axios.create({
    baseURL: "https://id.mars-ssn.ru",
    withCredentials: true
});

axiosUser.interceptors.response.use(
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


export type UserProfileResponse = {
    id: number;
    username: string;
    version: number;
    small_avatar: number;
    large_avatar: number;
    fullscreen_avatar: number;
};
export function getUserProfileRequest(id: number): Promise<UserProfileResponse> {
    return axiosUser.get(`/api/users/${id}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Failed to fetch user profile:", error);
            throw error;
        });
}

export interface UpdateMeBodyInterface {
    username?: string,
};


export function updateMeRequest(updateMeBody: UpdateMeBodyInterface, authToken: string): Promise<UserProfileResponse> {
    if (updateMeBody.username === undefined) {
        throw new Error("Empty request");
    }
    return axiosUser.put("/api/users/me", updateMeBody, {
        headers: {
            "Authorization": "Bearer " + authToken
        }
    }).then(resp => {
        return resp.data;
    });
}

export interface UpdateMyAvatarBodyInterface { //Токены
    original: string;
    small: string;
    large: string;
    fullscreen: string;
}

export function updateMyAvatarRequest(updateMeBody: UpdateMyAvatarBodyInterface, authToken: string): Promise<UserProfileResponse> {
    return axiosUser.put("/api/users/me/avatar", updateMeBody, {
        headers: {
            "Authorization": "Bearer " + authToken
        }
    }).then(resp => {
        return resp.data;
    });
}

export function getUserVersion(userId: number): Promise<number> {
    return axiosUser.get(`/api/users/${userId}/version`).then(response => response.data);
}

export async function getUserCreatedAtRequest(userId: number): Promise<number> {
    try {
        const response = await axiosUser.get(`/api/users/${userId}/created-at`);
        // На сервере LocalDate приходит как "YYYY-MM-DD"
        const createdAt = response.data; 
        console.log("Дата создания (строка):", createdAt);

        return createdAt;
    } catch (error) {
        console.error("Ошибка при получении даты создания:", error);
        throw error;
    }
}

export async function likeUsername(username: string, limit: number = 10): Promise<UserProfileResponse[]> {
    if (username.length < 3) {
        throw new Error("Username must be at least 3 characters long");
    }
    
    try {
        const response = await axiosUser.get(`/api/users/like/username/${username}`, {
            params: {
                limit: limit
            }
        });
        return response.data;
    } catch (error) {
        console.error("Ошибка при поиске пользователей по username:", error);
        throw error;
    }
}