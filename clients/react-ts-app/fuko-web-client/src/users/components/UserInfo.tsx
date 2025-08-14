import { type User } from "../models/user";
import { instantStringToDate } from "../../general/utils/InstantParser";
import { useUserById } from "../hooks/useUserById";
import { useAuthContext } from "../../auth/AuthContext";
import { FilePreview } from "../../files/components/FilePreview";
import { useFileById } from "../../files/hooks/useFileById";

import "./UserInfo.css"; // Assuming you have a CSS module for styling

export function UserInfo({ userId }: { userId: number }) {
    const identity = useAuthContext();
    const user: User | null | undefined = useUserById(userId);
    const avatar = useFileById(user?.avatarId, undefined);
    

    const itsMe: boolean = identity.myUserId === userId;

    if (user === undefined) {
        return <h2>Loading...</h2>
    }

    if (user === null) {
        console.error("User cache is not available.");
        return <h1>Error: User cache is not available.</h1>;
    }

    console.log("User:", user);
    return (
        <div className="user-info-container">
            <div className="user-avatar">
                {avatar && <FilePreview file={avatar} />}
            </div>
            <div className="user-details">
                <h1>User Info:</h1>
                <p>User Id: {userId}</p>
                <p>Avatar Id: {user ? user.avatarId : "Loading..."}</p>
                <p>Version: {user ? user.version : "Loading..."}</p>
                <p>Username: {user ? user.username : "Loading..."}</p>
                <p>Created At: {user ? instantStringToDate(user.createdAt).toLocaleString() : "Unknown"}</p>
                {itsMe &&
                    <button onClick={() => identity.logout()}>Logout</button>
                }
            </div>
        </div>
   );
}