import { Navigate, useLocation, Outlet } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuthContext } from "../AuthContext";

export function ProtectedOutlet({ loadComponent }: { loadComponent?: ReactNode }) {
    const location = useLocation();
    const { authenticated, myUserId } = useAuthContext();
    console.log("Rendering ProtectedOutlet, authenticated:", authenticated);
    if (authenticated === "not_authenticated" || authenticated === "error_authenticated") {
        return <Navigate to={`/login?redirectUrl=${location.pathname}`} replace />;
    }
    if (loadComponent && authenticated !== "authenticated") {
        return loadComponent;
    }

    console.log("authenticated myUserId: " + myUserId);

    return <Outlet />;
}

export function Protected({children, loadComponent}: { children: ReactNode, loadComponent?: ReactNode }) {
    const location = useLocation();
    const { authenticated } = useAuthContext();
    console.log("Rendering Protected, authenticated:", authenticated);
    if (authenticated === "not_authenticated" || authenticated === "error_authenticated") {
        return <Navigate to={`/login?redirectUrl=${location.pathname}`} replace />;
    }
    if (loadComponent && authenticated == "unknown") {
        return loadComponent;
    }
    return children;
}