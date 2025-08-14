// import { useAuth } from "../../auth/AuthContext";
// import { useCache } from "../../general/components/CacheContext";
// import { useState } from "react";

// export function TestFileApi() {
//     const { fileCache } = useCache();
//     const { identity } = useAuth();

//     const [fileId, setFileId] = useState("");
//     const [isPrivate, setIsPrivate] = useState(false);
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [uploadResult, setUploadResult] = useState<string | null>(null);
//     const [file, setFile] = useState<any>(null);
//     const [blobUrl, setBlobUrl] = useState<string | null>(null);

//     const getAccessTokenFunc = async (): Promise<string | null> => {
//         const payload = {
//             file_ids: [Number(fileId)],
//             exp: Math.floor(Date.now() / 1000) + 60 * 5 // 5 минут
//         };
//         const base64Payload = btoa(JSON.stringify(payload));
//         return `xxx.${base64Payload}.yyy`;
//     };

//     const handleDownload = async () => {
//         const id = Number(fileId);
//         if (isNaN(id)) {
//             alert("Введите корректный ID");
//             return;
//         }

//         if (identity.getAuthenticated() !== "authenticated")
//                 throw new Error("Not authorized.");
//             const accessToken: string | null = identity.getAccessToken();
//             if (accessToken == null) 
//                 throw new Error("access token equals null.");

//         const file = await fileCache.getFileById(id, isPrivate, accessToken, isPrivate ? getAccessTokenFunc : undefined);

//         if (file) {
//             setFile(file);
//             const url = URL.createObjectURL(file.blob);
//             setBlobUrl(url);
//         } else {
//             setFile(null);
//             setBlobUrl(null);
//             alert("Файл не найден или доступ запрещён");
//         }
//     };

//     const handleUpload = async () => {
//         if (!selectedFile) {
//             alert("Выберите файл");
//             return;
//         }

//         try {
//             if (identity.getAuthenticated() !== "authenticated")
//                 throw new Error("Not authorized.");
//             const accessToken: string | null = identity.getAccessToken();
//             if (accessToken == null) 
//                 throw new Error("access token equals null.");
//             const result = await fileCache.uploadFile(selectedFile, isPrivate, accessToken);
//             setUploadResult(result);
//             alert("Файл успешно загружен");
//         } catch (err: any) {
//             alert("Ошибка при загрузке: " + err.message);
//         }
//     };

//     return (
//         <div>
//             <h2>Тест FileCache</h2>

//             <div>
//                 <input
//                     type="text"
//                     value={fileId}
//                     onChange={(e) => setFileId(e.target.value)}
//                     placeholder="ID файла"
//                 />
//             </div>

//             <div>
//                 <label>
//                     <input
//                         type="checkbox"
//                         checked={isPrivate}
//                         onChange={(e) => setIsPrivate(e.target.checked)}
//                     />
//                     Приватный
//                 </label>
//             </div>

//             <div>
//                 <button onClick={handleDownload}>Загрузить по ID</button>
//             </div>

//             <hr />

//             <div>
//                 <input
//                     type="file"
//                     onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
//                 />
//                 <button onClick={handleUpload}>Отправить файл</button>
//                 {uploadResult && (
//                     <p>Результат загрузки: {uploadResult}</p>
//                 )}
//             </div>

//             <hr />

//             {file && (
//                 <div style={{ marginTop: "1em" }}>
//                     <p><strong>Имя:</strong> {file.filename}</p>
//                     <p><strong>Размер:</strong> {file.size} байт</p>
//                     <p><strong>Приватный:</strong> {file.isPrivate ? "Да" : "Нет"}</p>
//                     <p><strong>Создан:</strong> {file.createdAt}</p>

//                     {blobUrl && (
//                         <>
//                             <p><strong>Blob:</strong></p>
//                             {file.blob.type.startsWith("image/") ? (
//                                 <img src={blobUrl} alt="Изображение" style={{ maxWidth: "200px" }} />
//                             ) : (
//                                 <a href={blobUrl} download={file.filename}>Скачать файл</a>
//                             )}
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }
