import { createContext, useEffect, useState } from "react";
import type { ChildrenType } from "../models/ChildrenType";
import { getUserIdFromKeycloakToken, updateAndCheckTokenHasUserId } from "./utils/user-utils";
import { createUser } from "./api/userApi";

type CurrentUserContextType = {
    userCreated: boolean;
    isUserCreatedLoading: boolean;
    tokenHasUserId: boolean;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
    userCreated: false,
    isUserCreatedLoading: true,
    tokenHasUserId: false,
});



export const CurrentUserProvider = ({children}: ChildrenType ) => {
    const [userCreated, setUserCreated] = useState<boolean>(false);
    const [isUserCreatedLoading, setIsUserCreatedLoading] = useState<boolean>(true);
    const [tokenHasUserId, setTokenHasUserId] = useState<boolean>(false);

    useEffect(() => {
        if (userCreated) {
            return;
        }
        
        const userId = getUserIdFromKeycloakToken();
        if (userId === null) {
            console.warn("User ID is null");
            createUser()
                .then(async () => {
                    setUserCreated(true);
                    const tokenHasUserId = await updateAndCheckTokenHasUserId();
                    if (!tokenHasUserId) {
                        console.error("User ID was not added to the token after creation");
                        // Перенаправить на страницу с ошибкой создания пользователя
                        return;
                    }
                    setIsUserCreatedLoading(false);
                    setTokenHasUserId(tokenHasUserId);
                })
                .catch((error) => {
                    console.error("Error creating user:", error);
                    //Перенаправить на страницу с ошибкой создания пользователя
                    return;
                });
        }
        else {
            setUserCreated(true);
            setIsUserCreatedLoading(false);
            setTokenHasUserId(true);
        }

        
    }, []);

    const value: CurrentUserContextType = {
        userCreated,
        isUserCreatedLoading,
        tokenHasUserId
    };
    return (
        <CurrentUserContext.Provider value={value}>
            {children}
        </CurrentUserContext.Provider>
    );
};
