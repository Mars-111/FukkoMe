import { useEffect, useRef, useState } from "react";
import { type FileType } from "../models/fileType";
import { fileDb } from "../internal/db/fileCacheDatabase";
import { downloadFileRequest } from "../internal/api/fileApi";
import { useFileFromDb, type FileFromDbState } from "../internal/db/hooks/useFileFromDb";
import { useIdentity } from "../../auth/hooks/useIdentity";


export function useFileById(fileId: number | null | undefined, getAccessFileToken?: () => Promise<string | null>) {
    const identity = useIdentity();
    const [file, setFile] = useState<FileType | null | undefined>(undefined);

    const fileFromDb: FileFromDbState = useFileFromDb(fileId);

    const isDownloadingRef = useRef<boolean>(false);

    // Если файл появился в кэше → сразу обновляем стейт
    useEffect(() => {
        if (fileFromDb.status === "found" && fileFromDb.file.id !== file?.id) {
            console.log("Файл найден в кэше: " + fileFromDb.file.id);
            setFile(fileFromDb.file);
        }
        else {
            console.log("Файл не найден в кэше: " + fileId);
        }
    }, [fileFromDb]);


    //активируем обновления из бд
    //TODO: Передаелать под проверку токена
    useEffect(() => {
        if (!fileId || fileId < 1) {
            setFile(null);
        };
        if (file?.id === fileId) return;
    
        if (fileFromDb.status === "not-found" && fileId) {
            console.log("Файл не найден в кэше, загружаем с сервера: ", fileId);
            if (identity.state !== "authenticated") return;
            if (!identity.accessToken) return;
            
            if (!isDownloadingRef.current) {
                isDownloadingRef.current = true;
            }
            const loadFile = async () => {
                const isPrivate: boolean = !!getAccessFileToken;
                downloadFileRequest(fileId, isPrivate ? await getAccessFileToken!() : null, identity.accessToken!)
                    .then((fileData) => {
                        if (!fileData) {
                            setFile(null);
                            console.error("Ошибка при получении файла (пустой файл).");
                            return;
                        }
                        setFile(fileData); 
                        fileDb.files.put(fileData).catch((error) => {
                            console.error("Ошибка при сохранении файла в кэш:", error);
                        });
                    }).catch((error) => {
                        console.error("Ошибка при получении файла:", error);
                        setFile(null);
                    })
                    .finally(() => {
                        isDownloadingRef.current = false;
                    });
            };
            loadFile();
        }
    }, [fileId, fileFromDb, identity.state, identity.accessToken, getAccessFileToken, file]);



    return file;
}