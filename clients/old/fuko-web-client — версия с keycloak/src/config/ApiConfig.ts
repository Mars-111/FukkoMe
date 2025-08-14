import axios from "axios";
import { getToken } from "../auth/keycloak-utils";

const API_CHAT_SERVICE_URL = "https://chats.mars-ssn.ru/api";
const API_FILE_SERVICE_URL = "https://files.mars-ssn.ru/api";

export const chatServiceApi = axios.create({
    baseURL: API_CHAT_SERVICE_URL,
});

export const fileServiceApi = axios.create({
    baseURL: API_FILE_SERVICE_URL,
});

chatServiceApi.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        else {
            console.error("No token found, request will not be authenticated.");
        }
        return config;
    },
    (error) => {
        console.error("Error in request interceptor:", error);
        return Promise.reject(error);
    }
);

chatServiceApi.interceptors.response.use(
    (response) => {
        console.log("Успешный запрос:", response);
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            console.error(`Ошибка ответа сервера: ${status} - ${error.response.statusText}`);
        }
        else if (error.request) {
            console.warn('Сервер не ответил (возможно CORS или отключение сервера)'); 
        }
        else {
            console.error("Ошибка при настройке запроса:", error.message);
        }
        return Promise.reject(error);
    }
);


