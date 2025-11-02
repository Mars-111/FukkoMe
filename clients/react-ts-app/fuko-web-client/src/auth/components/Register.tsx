import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useIdentity, type RegisterProps } from "../hooks/useIdentity";
import { useEffect, useState } from "react";



export function Register() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const identity = useIdentity();

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    const redirectUrl = searchParams.get('redirectUrl') || '/';

    useEffect(() => {
        if (identity.state === "authenticated") {
            navigate(redirectUrl, { replace: true });
        }
    }, [identity.state]);

    const handleConflictData = (data: string) => {
        if (data.includes("username")) {
            setUsernameError("Username is already taken.");
        }
        if (data.includes("email")) {
            setEmailError("Email is already registered.");
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data: RegisterProps = {
            username: formData.get("username")?.toString() ?? "",
            email: formData.get("email")?.toString() ?? "",
            password: formData.get("password")?.toString() ?? "",
        };
        if (data.username !== "" && data.email !== "" && data.password !== "") {
            identity.register(data, redirectUrl).then((result) => {
                if (result) {
                    identity.authenticate({client: "web", username: data.username, password: data.password, redirectUrl});
                } else {
                    setErrorMessage("Registration failed.");
                }
            }).catch((error) => {
                if (error.response && error.response.status && error.response.status === 409) {
                    if (error.response.data) {
                        handleConflictData(error.response.data as string);
                    }
                }
                console.error("Registration failed:", error);
                setErrorMessage("Registration failed. Please try again.");
            });
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" onChange={() => setUsernameError(null)} required />
                    {usernameError && <span style={{ color: 'red' }}>{usernameError}</span>}
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" onChange={() => setEmailError(null)} required />
                    {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}