import Dexie from "dexie";
import type { Table } from "dexie";
import type { Message } from "../models/message";

export class MessagesCacheDatabase extends Dexie {
    messages!: Table<Message, number>;

    constructor() {
        super("MessagesCache");
        this.version(1).stores({
            messages: "id",
        });
    }
}

export const messagesDb = new MessagesCacheDatabase();