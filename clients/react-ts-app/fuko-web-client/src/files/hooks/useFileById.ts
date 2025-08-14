import { useEffect, useRef, useState } from "react";
import { type FileType } from "../models/fileType";
import { fileDb } from "../internal/db/fileCacheDatabase";
import { useAuthContext } from "../../auth/AuthContext";
import { downloadFileRequest } from "../internal/api/fileApi";
import { useFileFromDb, type FileFromDbState } from "../internal/db/hooks/useFileFromDb";


export function useFileById(fileId: number | null | undefined, getAccessFileToken?: () => string) {
    const identity = useAuthContext();
    const [file, setFile] = useState<FileType | null | undefined>(undefined);

    const fileFromDb: FileFromDbState = useFileFromDb(fileId);

    const isDownloadingRef = useRef<boolean>(false);

    // Если файл появился в кэше → сразу обновляем стейт
    useEffect(() => {
        if (fileFromDb.status === "found" && fileFromDb.file.id !== file?.id) {
            setFile(fileFromDb.file);
        }
    }, [fileFromDb]);


    //активируем обновления из бд
    useEffect(() => {
        console.log("file from db: ", fileFromDb);
        console.log("fileId: ", fileId);
        if (file?.id === fileId) return;

        if (fileFromDb.status === "not-found" && fileId) {
            console.log("Файл не найден в кэше, загружаем с сервера: ", fileId);
            if (identity.authenticated !== "authenticated") return;
            
            const isPrivate: boolean = !!getAccessFileToken;
            if (!isDownloadingRef.current) {
                isDownloadingRef.current = true;
                downloadFileRequest(fileId, isPrivate ? getAccessFileToken!() : null, identity.getAccessToken()!)
                    .then((fileData) => {
                        if (!fileData) {
                            setFile(null);
                            return;
                        }
                        setFile(fileData); 
                        fileDb.files.put(fileData).catch((error) => {
                            console.error("Ошибка при сохранении файла в кэш:", error);
                        });
                        isDownloadingRef.current = false;
                    }).catch((error) => {
                        console.error("Ошибка при получении файла:", error);
                        setFile(null);
                        isDownloadingRef.current = false;
                    });
            }
        }
    }, [fileId, fileFromDb, identity.authenticated]);



    return file;
}