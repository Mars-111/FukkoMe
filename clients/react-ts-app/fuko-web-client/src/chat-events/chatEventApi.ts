import type { Axios } from "axios";
import axios from "axios";
import { objectToChatEvent, type ChatEvent } from "./chatEvent";

const axiosEvent: Axios = axios.create({
    baseURL: "https://id.mars-ssn.ru",
    withCredentials: true
});

axiosEvent.interceptors.response.use(
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

export async function getChatEventsRequest(chatId: number, afterTimelineId?: number, limit?: number): Promise<ChatEvent[] | null> {
    const params: Record<string, number> = {};
    if (afterTimelineId !== undefined) {
        params.afterTimelineId = afterTimelineId;
    }
    if (limit !== undefined) {
        params.limit = limit;
    }

    const response = axiosEvent.get(`/api/chat/${chatId}/events`, { params }).then(resp => { //resp это ChatEvent[] 
        //надо отделить каждй chatEvent из массива и привести от obj к ChatEvent через objectToChatEvent
        return resp.data.map((obj: any) => objectToChatEvent(obj));
    }).catch(error => {
        console.error('Ошибка при получении событий чата:', error);
        return null;
    });

    return response;
}





