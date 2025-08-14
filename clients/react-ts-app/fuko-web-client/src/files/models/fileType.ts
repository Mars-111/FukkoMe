


export type FileType = {
    id: number;
    filename: string;
    extension: string;
    size: number;
    blob: Blob;
    isPrivate: boolean;
    createdAt: string;
};