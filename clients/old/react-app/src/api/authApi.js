import { apiChatsService } from "../config/api";

export function createUser() {
    return apiChatsService.post("/users");
}