import { useParams } from "react-router-dom";
import { UserInfo } from "../../../users/components/UserInfo";

export function UserInfoRouter() {
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);

    if (isNaN(userId)) {
        return <h1>Error: Invalid user ID</h1>;
    }

    return <UserInfo userId={userId} />;
}
