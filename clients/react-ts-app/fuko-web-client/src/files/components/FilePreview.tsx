import { type FileType } from "../models/fileType";

import "./FilePreview.css"; 

export function FilePreview({ file, className = "" }: { file: FileType; className?: string; }) {
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(
        file.extension.toLowerCase()
    );

    const formatSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
        return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
    };

    return (
        <div className={`file-preview ${className}`}>
            {isImage ? (
                <img
                src={URL.createObjectURL(file.blob)}
                alt={file.filename}
                className="file-preview-img"
                />
            ) : (
                <div className="file-preview-placeholder">
                <span className="file-preview-ext">{file.extension}</span>
                </div>
            )}

            <div className="file-preview-info">
                <p className="truncate font-medium">{file.filename}</p>
                <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                {file.isPrivate && <p className="text-xs text-red-500">🔒 Private</p>}
            </div>
        </div>
    );
}
