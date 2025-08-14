import { Dexie } from "dexie";
import type { Table } from "dexie";
import type { FileType } from "../../models/fileType";


export class FileCacheDatabase extends Dexie {
    files!: Table<FileType, number>;

    constructor() {
        super("FileCache");
        this.version(1).stores({
            files: "id"
        });
    }
}

export const fileDb = new FileCacheDatabase();