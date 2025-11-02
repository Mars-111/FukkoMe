import { useIdentity } from "../../auth/hooks/useIdentity";
import { UserInfo } from "./UserInfo";


export function MyInfo() {
    const { myUserId } = useIdentity();
    if (!myUserId) {
        return "Loading...";
    }
    return <UserInfo userId={myUserId} />; 
}