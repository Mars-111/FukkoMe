import React, { useEffect, useState } from "react";
import "./File.css";
import { getAccessTokenForMessageFiles } from "../services/api";
import { FileText } from "lucide-react"; // или замени на 📄 если не используешь lucide

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

export default function File({ file }) {
    const {
        extension,
        file_id,
        filename,
        height,
        message_id,
        size,
        width
    } = file;

    const [localUrl, setLocalUrl] = useState(null);
    const [loaded, setLoaded] = useState(false);

    const isImage = extension && IMAGE_EXTENSIONS.includes(extension.toLowerCase());
    const hasDimensions = width && height;
    const aspectRatio = hasDimensions ? width / height : 1;
    const readableSize = size ? (size / 1024).toFixed(1) + " KB" : "";

    // useEffect(() => {
    //     if (isImage && hasDimensions) {
    //         getAccessTokenForMessageFiles(message_id, [file_id])
    //             .then(token => {
    //                 // const url = `/api/files/${file_id}?token=${token}`;
    //                 // setLocalUrl(url);
    //             })
    //             .catch(err => {
    //                 console.error("Ошибка загрузки изображения:", err);
    //             });
    //     }
    // }, [file_id, message_id, isImage, hasDimensions]);

    if (isImage && hasDimensions) {
        return (
            <div className="file-wrapper" style={{ aspectRatio }}>
                {loaded && localUrl ? (
                    <img
                        src={localUrl}
                        alt={filename || "image"}
                        className="file-img"
                        onLoad={() => setLoaded(true)}
                        onError={() => setLoaded(false)}
                    />
                ) : (
                    <div className="file-placeholder">
                        Загрузка изображения…
                    </div>
                )}
            </div>
        );
    }

    // Обычные файлы
    return (
        <div className="file-card">
            <div className="file-icon">
                <FileText size={32} />
            </div>
            <div className="file-info">
                <div className="file-name">{filename || "Файл"}</div>
                <div className="file-meta">
                    {extension && <span className="file-ext">{extension.toUpperCase()}</span>}
                    {readableSize && <span className="file-size">{readableSize}</span>}
                </div>
            </div>
        </div>
    );
}
