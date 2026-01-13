import { useParams } from "react-router-dom";
import { Messages } from "../../../messages/Mesages";

export function MessagesRouter() {
    const { chatId } = useParams<{ chatId: string }>();
    const chatIdNumber = Number(chatId);

    if (isNaN(chatIdNumber)) {
        return <h1>Error: Invalid chat ID</h1>;
    }

    return <Messages key={"msgs" + chatIdNumber} chatId={chatIdNumber} />;
}
