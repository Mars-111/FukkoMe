import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useIdentity } from '../hooks/useIdentity';
import { error } from 'console';

export function Login() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const identity = useIdentity();
    const [awaitAuthorization, setAwaitAuthorization] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // const clientIdParam = searchParams.get('clientId');
    // const grantTypeParam = searchParams.get('grantType');

    useEffect(() => {
        console.log("Ререндер state: " + identity.state)
        if (identity.state === "authenticated") {
            const redirectUrl = searchParams.get('redirectUrl') || '/';
            navigate(redirectUrl, { replace: true });
        }
        else if (identity.state === "error_authenticated") {
            setAwaitAuthorization(false);
            setErrorMessage("Login failed.");
        }


    }, [identity.state]);

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const redirectUrl = searchParams.get('redirectUrl') || '/';

        setAwaitAuthorization(true);

        identity.authenticate({
            username,
            password,
            redirectUrl,
            client: "web"
        }).then(() => {
            setAwaitAuthorization(false);
        }).catch((error) => {
            console.error("Authorization failed:", error);
            setAwaitAuthorization(false);
            setErrorMessage("Login failed. Please check your credentials and try again.");
        });
    };

    console.log("redirect url: " + searchParams.get('redirectUrl') || '/');

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">Username or email:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                {awaitAuthorization && <p>Awaiting authorization...</p>}
                {!awaitAuthorization && <button type="submit">Login</button>}
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            Login state: {identity.state}
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}