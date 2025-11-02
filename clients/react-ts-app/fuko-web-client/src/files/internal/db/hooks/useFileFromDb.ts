import { useLiveQuery } from "dexie-react-hooks";
import { fileDb } from "../fileCacheDatabase";
import { type FileType } from "../../../models/fileType";

export type FileFromDbState = 
    | { status: "no-id" }                // fileId нет → даже не ищем
    | { status: "loading" }              // ищем в БД
    | { status: "not-found" }            // искали → нет
    | { status: "error-id" }
    | { status: "found"; file: FileType }; // искали → нашли

export function useFileFromDb(fileId: number | null | undefined): FileFromDbState {
    return (
        useLiveQuery(async () => {
            if (!fileId) return { status: "no-id" } as FileFromDbState;
            if (fileId < 0) return { status: "error-id" } as FileFromDbState;

            const file = await fileDb.files.get(fileId);
            if (file) {
                return { status: "found", file } as FileFromDbState;
            }
            return { status: "not-found" } as FileFromDbState;
        }, [fileId], { status: "loading" }) ?? { status: "loading" }
    );
}


