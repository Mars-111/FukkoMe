import { Navigate, useLocation, Outlet } from "react-router-dom";
import { type ReactNode } from "react";
import { useIdentity } from "../hooks/useIdentity";

export function ProtectedOutlet({ loadComponent }: { loadComponent?: ReactNode }) {
    const location = useLocation();
    const { state } = useIdentity();
    if (state === "not_authenticated" || state === "error_authenticated") {
        return <Navigate to={`/login?redirectUrl=${location.pathname}`} replace />;
    }
    if (loadComponent && state !== "authenticated") {
        return loadComponent;
    }
    return <Outlet />;
}

export function Protected({children, loadComponent}: { children: ReactNode, loadComponent?: ReactNode }) {
    const location = useLocation();
    const { state } = useIdentity();
    if (state === "not_authenticated" || state === "error_authenticated") {
        return <Navigate to={`/login?redirectUrl=${location.pathname}`} replace />;
    }
    if (loadComponent && state !== "authenticated") {
        return loadComponent;
    }
    return children;
}