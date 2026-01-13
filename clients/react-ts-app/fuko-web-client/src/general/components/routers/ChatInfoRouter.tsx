import { useParams } from "react-router-dom";
import { ChatInfo } from "../../../chats/components/ChatInfo";

export function ChatInfoRouter({countMembersDataPermissibleTimeDeviationMs, membersDataPermissibleTimeDeviationMs}: {countMembersDataPermissibleTimeDeviationMs?: number, membersDataPermissibleTimeDeviationMs?: number}) {
    const { chatId } = useParams<{ chatId: string }>();
    const chatIdNumber = Number(chatId);

    if (isNaN(chatIdNumber)) {
        return <h1>Error: Invalid chat ID</h1>;
    }

    return <ChatInfo key={"chatInfo" + chatIdNumber} chatId={chatIdNumber} countMembersDataPermissibleTimeDeviationMs={countMembersDataPermissibleTimeDeviationMs} membersDataPermissibleTimeDeviationMs={membersDataPermissibleTimeDeviationMs} />;
}
