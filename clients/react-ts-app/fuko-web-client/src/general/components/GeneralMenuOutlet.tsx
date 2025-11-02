import { Navigate, Link, Outlet } from "react-router-dom";
import { AwaitAvatar, SmallUserAvatar } from "../../users/components/Avatar";
import { useUserById } from "../../users/hooks/useUserById";
import './generalMenu.css';
import { useIdentity } from "../../auth/hooks/useIdentity";


export function GeneralMenuOutlet() {
    const { state, myUserId } = useIdentity();

    return (
        <div>
            {/* <div className="user-info">
                {myUserId ? <UserInfoInBar userId={myUserId} /> : <AwaitingUserInfoInBar />}
            </div> */}
            <div className="menu-options"> {/* Меню сверху */}
                {myUserId ? <UserInfoInBar userId={myUserId} /> : <AwaitingUserInfoInBar />}
                <Link to="/app/search">Global search</Link>
            </div>
            <div className="action-windows"> {/* Окна действий */}
                {state === "unknown" && <h1>Login in account...</h1>}
                {state === "not_authenticated" && <Navigate to="/login" />}
                {state === "error_authenticated" && <h1>Error login!</h1>}
                {state === "authenticated" && <Outlet />}
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
                {userId && user ? <SmallUserAvatar user={user} circle={true} /> : <AwaitAvatar size="small" circle={true} />}
            </div>
            <div className="user-name">
                {user ? user.username : "Loading..."}
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