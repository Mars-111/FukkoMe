import { useParams } from "react-router-dom";
import { ChatSettings } from "../../../chats/components/ChatSettings";

export function ChatSettingsRouter() {
    const { chatId } = useParams<{ chatId: string }>();
    const chatIdNumber = Number(chatId);

    if (isNaN(chatIdNumber)) {
        return <h1>Error: Invalid chat ID</h1>;
    }

    return <ChatSettings key={"chatInfo" + chatIdNumber} chatId={chatIdNumber} />;
}
