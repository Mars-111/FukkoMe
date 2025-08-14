import type { Axios } from "axios";
import axios from "axios";
import type { FileType } from "../../models/fileType";


const axiosFile: Axios = axios.create({
    baseURL: "https://file.mars-ssn.ru/api/files",
    withCredentials: true
});


axiosFile.interceptors.response.use(
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


/**
 * Загружает файл на сервер
 * @param file - файл для загрузки
 * @param size - исходный размер файла (можно получить через file.size)
 * @param isPrivate - приватный ли файл
 * @returns токен доступа к файлу от сервера
 */
export function uploadFileRequest(file: File, isPrivate: boolean, authToken: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file); // только файл в теле

    const params = new URLSearchParams({
        size: file.size.toString(),
        isPrivate: isPrivate.toString()
    });

    return axiosFile.post(`/upload?${params.toString()}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": "Bearer " + authToken
        }
    }).then(response => response.data);
}


export async function downloadFileRequest(id: number, accessToken: string | null, authToken: string): Promise<FileType> {
    const headers: Record<string, string> = {
        "Authorization": "Bearer " + authToken
    };

    if (accessToken) {
        headers["AccessFileToken"] = accessToken;
    }
    
    const metaResp = await axiosFile.get("/" + id, {
        headers
    });

    const meta = metaResp.data as {
        id: number;
        extension: string;
        size: number;
        filename: string;
        createdAt: string;
    };
    const S3Url = metaResp.data.S3Url as string;

    // Второй запрос — получаем сам файл как blob
    const blobResp = await fetch(S3Url, {mode: "cors"});
    const blob = await blobResp.blob();

    return {
        id: meta.id,
        filename: meta.filename,
        extension: meta.extension,
        size: meta.size,
        blob,
        isPrivate: !!accessToken,
        createdAt: meta.createdAt,
    };
}