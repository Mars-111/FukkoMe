import type { Axios } from "axios";
import axios from "axios";
import { objectToChatRole, type ChatRole } from "../../models/chatRole";

const axiosChatRoles: Axios = axios.create({
    baseURL: "https://chats.mars-ssn.ru",
    withCredentials: true
});

axiosChatRoles.interceptors.response.use(
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


export async function getRoleByIdRequest(roleId: number): Promise<ChatRole> {
    const responce = await axiosChatRoles.get(`/api/roles/${roleId}`);
    return objectToChatRole(responce.data);
}

export async function getRoleVersionByIdReauest(chatRoleId: number): Promise<number | null> {
    const responce = await axiosChatRoles.get(`/api/roles/${chatRoleId}/version`);
    return (responce.data as number) || null;
}

