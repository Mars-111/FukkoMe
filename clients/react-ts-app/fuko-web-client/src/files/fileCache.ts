import { FileCacheDatabase } from "./internal/db/fileCacheDatabase";
import InvalidFileError from "../general/errors/classes/invalidFileError";
import { downloadFileRequest, uploadFileRequest } from "./internal/api/fileApi";
import type { AccessPrivateFileToken } from "./models/accessPrivateFileToken";
import InternalLogicError from "../general/errors/classes/internalLogicError";
import type { FileType } from "./models/fileType";

export class FileCache {
    private db: FileCacheDatabase;

    private accessPrivateFileTokenMap: Map<number, AccessPrivateFileToken>;

    constructor() {
        this.db = new FileCacheDatabase();
        this.accessPrivateFileTokenMap = new Map<number, AccessPrivateFileToken>();
    }

    async uploadFile(file: File, isPrivate: boolean, authToken: string): Promise<string> {
        if (file.size <= 0) {
            console.error("file size <= 0!");
            throw new InvalidFileError("file size <= 0");
        }
        return uploadFileRequest(file, isPrivate, authToken);
    }

    public async getFileById(id: number, isPrivate: boolean, authToken: string, getAccessTokenFunc: (() => Promise<string | null>) | undefined): Promise<FileType | null> {
        try {
            if (isPrivate && !getAccessTokenFunc)
                throw new InternalLogicError("getAccessTokenFunc is undefined, but isPrivate = true");
            else if (!isPrivate && getAccessTokenFunc) 
                throw new InternalLogicError("getAccessTokenFunc is not undefined, but isPrivate = false");

            let file: FileType | undefined = undefined;
            file = await this.db.files.get(id);
            if (file)
                return file;


            let accessToken: string | null = null;

            if (isPrivate && this.accessPrivateFileTokenMap.has(id)) {
                const accessTokenEntityTmp = this.accessPrivateFileTokenMap.get(id);
                if (accessTokenEntityTmp && accessTokenEntityTmp.expiresAt.getTime() > Date.now()) {
                    accessToken = accessTokenEntityTmp.token;
                }
            }
            else if (isPrivate) {
                accessToken = await getAccessTokenFunc!();
            }

            if (isPrivate && !accessToken)
                return null;

            
            if (accessToken) {
                //Надо из токена достать file_ids (Long массив) и для каждого из id сделаь запис в accessPrivateFileTokenMap
                const payloadBase64 = accessToken.split('.')[1];
                const payloadJson = this.decodeBase64(payloadBase64);
                const payload = JSON.parse(payloadJson);

                const fileIds: unknown = payload.file_ids;
                if (!Array.isArray(fileIds) || !fileIds.every(id => typeof id === 'number')) {
                    throw new Error("Invalid file_ids in access token");
                }

                let accessTokenContainsCurrentId: boolean = false;

                const accessPrivateFileToken: AccessPrivateFileToken = {
                    token: accessToken,
                    expiresAt: new Date(payload.exp * 1000)
                };
                for (const fileId of fileIds) {
                    if (fileId === id) 
                        accessTokenContainsCurrentId = true;
                    this.accessPrivateFileTokenMap.set(fileId, accessPrivateFileToken);
                }

                if (!accessTokenContainsCurrentId) {
                    return null; //Токен разрешения на полечения файла не содержит нужного id
                }
            }
            
            file = await downloadFileRequest(id, accessToken, authToken);

            this.db.files.add(file, id);

            return file;
        } catch (error) {
            console.error("Error fetching file bu Id: " + error);
            return null;
        }
    }


    private decodeBase64(base64: string): string {
        if (typeof window !== "undefined") {
            return atob(base64);
        } else {
            return Buffer.from(base64, 'base64').toString('utf-8');
        }
    }

}