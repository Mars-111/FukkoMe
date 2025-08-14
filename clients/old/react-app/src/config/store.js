import Dexie from "dexie";

class CashDatabase extends Dexie {
    constructor() {
        super("CashDB");
        this.version(1).stores({
            chats: "id, name, tag, type, owner_id, created_at",
            messages: "id, timeline_id, type, flags, chat_id, sender_id, content, timestamp, reply_to, forwarded_from",
            
        });
    }
}