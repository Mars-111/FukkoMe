import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import keycloak from './keycloak';
import {AppProvider} from './AppContext';
import { getUserId } from "./services/jwtService";
import { createUser } from "./services/api";


keycloak.init({ onLoad: 'login-required' }).then(async authenticated => {
    console.log("Keycloak token: ", keycloak.token);
    if (authenticated) {
        const token = keycloak.token;
        const userId = getUserId(token);
        if (!userId) {
            console.error("Не удалось получить user_id из токена");
            const response = await createUser(token);
            if (response) {
                console.log("Создан новый пользователь:", response);
                window.location.reload();
            }
        }
        createRoot(document.getElementById('root')).render(
            <AppProvider>
                <App/>
            </AppProvider>
        )
    } else {
        window.location.reload();
    }
}).catch(err => {
    console.error("Keycloak initialization failed", err);
});