import { useLocation } from "react-router-dom";

export function useRouteEntityId() {
    const { pathname } = useLocation();

    const userMatch = pathname.match(/\/user\/(\d+)/);
    if (userMatch) {
        return { type: "user", id: Number(userMatch[1]) };
    }

    const chatMatch = pathname.match(/\/chat\/(\d+)/);
    if (chatMatch) {
        return { type: "chat", id: Number(chatMatch[1]) };
    }

    return null;
}
