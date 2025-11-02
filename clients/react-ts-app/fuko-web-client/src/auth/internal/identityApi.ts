import type { Axios } from "axios";
import axios from "axios";

const axiosIdentity: Axios = axios.create({
    baseURL: "https://id.mars-ssn.ru",
    withCredentials: true
});

axiosIdentity.interceptors.response.use(
    (response) => {
        console.log('Успешный запрос');
        return response;
    },
    (error) => {
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

interface AuthenticateProps {
    grantType: "authorization_code" | "cookie", 
    redirectUrl: string,
    codeChallenge?: string,
    client: string,
    username: string,
    password: string
}


export function authenticateByCookie(props: AuthenticateProps): Promise<void> {
    const body = {
        username: props.username,
        password: props.password
    };
    return axiosIdentity.post("/api/authenticate", body, {
        params: {
            grantType: props.grantType,
            redirectUrl: props.redirectUrl,
            clientId: props.client,
            codeChallenge: props.codeChallenge
        }
    });
}

export function refreshAccessTokenByCookie(): Promise<string | null> {
    return axiosIdentity.post("/api/refresh").then(resp => {
        return resp.data;
    })
    .catch(error => {
        console.error("Failed to refresh access token:", error)
        return null;
    });
}

export interface RegisterRequestProps {
    username: string;
    password: string;
    email: string;
}

export function registerRequest(props: RegisterRequestProps): Promise<boolean> {
    return axiosIdentity.post("/api/register", props)
        .then(resp => {
            if (resp.status == 200) 
                return true;
            else
                return false;
        });
}

export function logoutRequest(): Promise<void> {
    return axiosIdentity.post("/api/logout");
}