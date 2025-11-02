import type { Axios } from "axios";
import axios from "axios";
import type { UserStatus } from "./status";



const axiosStatus: Axios = axios.create({
    baseURL: "https://status.mars-ssn.ru/api",
    withCredentials: true
});


axiosStatus.interceptors.response.use(
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

export interface UserStatusResponce {
    lastSeen?: number;
    onlineSessions?: Set<string>;
};

export function getUserStatusRequest(userId: number): Promise<UserStatusResponce> {
    return axiosStatus.get(`/${userId}/status`)
        .then(response => response.data)
        .catch(error => {
            console.error('Ошибка при получении статуса пользователя:', error);
            throw error;
        });
}