import { Navigate, Link, Outlet } from "react-router-dom";
import { AwaitAvatar, SmallUserAvatar } from "../../users/components/Avatar";
import { useUserById } from "../../users/hooks/useUserById";
import './generalMenu.css';
import { useIdentity } from "../../auth/hooks/useIdentity";
import { useMessengerLayoutStore } from "../../layout/messengerLayoutStore";
import { ChatCreate } from "../../chats/components/ChatCreate";
import { useCallback } from "react";
import { userFound } from "../../users/utils/userUtils";
import { useChatCacheMetaStore } from "../../chats/hooks/useChatCacheMetaStore";


export function GeneralMenuOutlet() {
    const { state, myUserId } = useIdentity();
    const addLeftTabNode = useMessengerLayoutStore(state => state.leftPanel.addTabNode); 
    const myChatIds = useChatCacheMetaStore((state) => state.myChatIds);


    const handleCreateChat = useCallback(() => {
        addLeftTabNode({ name: "create chat", reactNode: <ChatCreate />}, true);
    }, [addLeftTabNode]);

    return (
        <div className="general-menu-wrapper">
            <div className="menu-options"> {/* Меню сверху */}
                {myUserId ? <UserInfoInBar userId={myUserId} /> : <AwaitingUserInfoInBar />}
                <Link className="menu-link" to="/app">Main</Link>
                <button className="menu-link" onClick={handleCreateChat}>
                    Create chat
                </button>
                {myChatIds && <div>{Array.from(myChatIds).join(", ")}</div>};
            </div>
            <div className="action-windows"> {/* Окна действий */}
                <div className="action-content">
                    {state === "unknown" && <h1>Login in account...</h1>}
                    {state === "not_authenticated" && <Navigate to="/login" />}
                    {state === "error_authenticated" && <h1>Error login!</h1>}
                    {state === "authenticated" && <Outlet />}
                </div>
            </div>
            <div className="notifications">
                {/* Уведомления позже сделаю. Сделай просто справа снизу */}
            </div>
            <div className="errors">
                {/* Ошибки позже сделаю. Справа снизу */}
            </div>
        </div>
    );
}

function UserInfoInBar({ userId }: { userId: number }) {
    const user = useUserById(userId);

    return (
        <Link to="/app/user/me" className="user-info">
            <div className="avatar-small user-avatar">
                {userId && userFound(user) ? <SmallUserAvatar user={user} circle={true} /> : <AwaitAvatar size="small" circle={true} />}
            </div>
            <div className="user-name">
                {userFound(user) ? user.username : "Loading..."}
            </div>
        </Link>
    );
}

function AwaitingUserInfoInBar() {
    return (
        <div className="user-info">
            <div className="avatar-small user-avatar">
                <AwaitAvatar size="small" circle={true} />
            </div>
            <div className="user-name">
                Loading...
            </div>
        </div>
    );
}