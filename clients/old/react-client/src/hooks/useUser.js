import { useEffect, useState } from "react";
import keycloak from "../keycloak";
import { getUserId } from "../services/jwtService";
import { createUser, getUser } from "../services/api";

export default function useInitUser() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userId = getUserId(keycloak.token);
        if (userId) {
            setUser(getUser(userId));
        }
    }, []);

    return { user };
}