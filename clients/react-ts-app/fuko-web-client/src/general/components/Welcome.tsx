import { useEffect } from "react";
import { useIdentity } from "../../auth/hooks/useIdentity"
import { Link, useNavigate } from "react-router-dom";




export function Welcome() {
    const { state } = useIdentity();
    const navigate = useNavigate();

    useEffect(() => {
        if (state === "authenticated") {
            navigate("/app", { replace: true });
        }
    }, [state]);



    return (
        <div>
            <h1>Welcome to Fukkome</h1>
            <p>Your gateway to a xyzzy world.</p>
            <Link to="/login">Start your journey</Link>
        </div>
    );
}