import { type User } from "../models/user";
import { useUserById } from "../hooks/useUserById";
import { uploadUserCreatedAt, userFound } from "../utils/userUtils";
import { useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LargeUserAvatar } from "./Avatar";

import "./UserInfo.css";
import { useSocket } from "../../socket/useSocket";
import { useUserStatus } from "../../user-statuses/useUserSatus";
import { useIdentity } from "../../auth/hooks/useIdentity";
import { addRecentEntity } from "../../general/utils/recentEntityUtils";


export function UserInfo({ userId }: { userId: number }) {
    const { myUserId } = useIdentity();
    const user = useUserById(userId);
    const socket = useSocket();
    const userStatus = useUserStatus(userId);
    const navigate = useNavigate();

    useEffect(() => {
        if (userId !== null) {
            addRecentEntity(userId, "user");
        }
    }, [userId]);

    useEffect(() => {
        if (userId === myUserId) navigate('/app/user/me', { replace: true });
    }, [myUserId]);

    useEffect(() => {
        if (userId && socket.isOpen) {
            socket.subscribe({ type: "user", id: userId });
            return () => {
                socket.unsubscribe({ type: "user", id: userId });
            }
        }
    }, [userId, socket.isOpen]);

    useEffect(() => {
        if (userFound(user) && !user.createdAt)
            uploadUserCreatedAt(userId);
    }, [user]);

    const statusToString = useCallback((): string => {
        console.log("userStatus updating: ", userStatus);
        if (userId === myUserId) return "online";
        if (typeof userStatus === "object") {
            if (userStatus.online) return "online";
            if (!userStatus.lastSeen) return "long time ago";
            if (userStatus.lastSeen) return `last seen at ${new Date(userStatus.lastSeen).toLocaleString()}`;
        }
        return "awaiting...";
    }, [userStatus]);

    return (
        <div className="user-info-container">
            <div className="user-info-avatar">
                {userFound(user) && <LargeUserAvatar user={user} circle />}
            </div>
            <div className="user-details">
                <h1>User Info:</h1>
                <p>User Id: {userId}</p>
                <p>Avatar large Id: {userFound(user) ? user.largeAvatarId : "Loading..."}</p>
                <p>Version: {userFound(user) ? user.version : "Loading..."}</p>
                <p>Username: {userFound(user) ? user.username : "Loading..."}</p>
                <p>Status: {statusToString()}</p>
                <p>Created At: {userFound(user) && user.createdAt ? new Date(user.createdAt).toLocaleString() : "Loading..."}</p>
            </div>
            {userId === myUserId && 
                <div className="user-info-owner-details">
                    <Link to="/app/user/me/settings">Изменить</Link>
                </div>
            }
        </div>
   );
}


export function UserInfoAndSubToUser({ userId }: { userId: number }) {
    const { subscribe, unsubscribe } = useSocket();

    useEffect(() => {
        subscribe({ id: userId, type: "user" });
        return () => {
            unsubscribe({ id: userId, type: "user" });
        };
    }, []);

    return (
        <UserInfo userId={userId} />
    );
}