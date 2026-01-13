import { useParams } from "react-router-dom";
import { UserInfo, UserInfoAndSubToUser } from "../../../users/components/UserInfo";

export function UserInfoRouter() {
    const { userId } = useParams<{ userId: string }>();
    const userIdNumber = Number(userId);

    if (isNaN(userIdNumber)) {
        return <h1>Error: Invalid user ID</h1>;
    }

    return <UserInfo key={"usr" + userIdNumber} userId={userIdNumber} />;
}

export function UserInfoAndSubToUserRouter() {
    const { userId } = useParams<{ userId: string }>();
    const userIdNumber = Number(userId);

    if (isNaN(userIdNumber)) {
        return <h1>Error: Invalid user ID</h1>;
    }

    return <UserInfoAndSubToUser key={"usr" + userIdNumber} userId={userIdNumber} />;
}
