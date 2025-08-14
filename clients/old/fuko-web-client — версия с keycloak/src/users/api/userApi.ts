import { chatServiceApi } from "../../config/ApiConfig";

export function createUser() {
    return chatServiceApi.post("/users");
}