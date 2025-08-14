import { useState, useRef } from 'react';
import { getAccessTokenForMessageFiles } from '../services/api';


export default function useInitFile() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const saveFilesMap = useRef(new Map());

  function getFile(fileId) {
    if (saveFilesMap.current.has(fileId)) {
      return saveFilesMap.current.get(fileId);
    }
    const file = localStorage.getItem("fileId:" + fileId);
    if (file) {
      saveFilesMap.current.set(fileId, file);
      return file;
    }
    console.warn("Файл не найден в кэше и localStorage:", fileId);
    return null;
  }

  function saveFile(fileId, file) {
    saveFilesMap.current.set(fileId, file);
    localStorage.setItem("fileId:" + fileId, file);
  }




    // async function saveFilesByMessage(message) {
    //     if (!message || !message.media || !Array.isArray(message.media)) return;

    //     let accessMediaToken;
    //     try {
    //         accessMediaToken = await getAccessTokenForMessageFiles(message.id);
    //     } catch (e) {
    //         console.error("Не удалось получить accessFileToken:", e);
    //         return;
    //     }

    //     for (const media of message.media) {
    //         const fileId = media.media_id;

    //         // Пропускаем если уже загружено
    //         if (saveFilesMap.current.has(fileId)) {
    //         media.path = saveFilesMap.current.get(fileId); // добавим путь в мету
    //         continue;
    //         }

    //         const localCache = localStorage.getItem("fileId:" + fileId);
    //         if (localCache) {
    //         saveFilesMap.current.set(fileId, localCache);
    //         media.path = localCache;
    //         continue;
    //         }

    //         try {
    //         const fileBlob = await getFile(accessMediaToken, fileId); // <- должен возвращать Blob
    //         const mime = media.format;

    //         if (mime.startsWith("image/")) {
    //             const objectUrl = URL.createObjectURL(fileBlob);
    //             saveFile(fileId, objectUrl);
    //             media.path = objectUrl;
    //         } else {
    //             // Файл — просто пометим как не загруженный ещё
    //             media.path = null; // путь появится после клика
    //         }
    //         } catch (e) {
    //         console.error("Ошибка при загрузке файла:", fileId, e);
    //         }
    //     }
    // }


    




  function getSelectedFiles() {
    return selectedFiles;
  }

  function addSelectedFiles(newFiles) {
    // newFiles — FileList или массив файлов
    setSelectedFiles(prev => [...prev, ...Array.from(newFiles)]);
  }

  function removeSelectedFile(index) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  function clearSelectedFiles() {
    setSelectedFiles([]);
  }

  return {
    getSelectedFiles,
    addSelectedFiles,
    removeSelectedFile,
    clearSelectedFiles,
    getFile,
    saveFile,
  };
}
