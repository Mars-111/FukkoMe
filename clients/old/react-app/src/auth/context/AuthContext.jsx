import React, { createContext, useContext, useEffect, useReducer } from 'react';
import keycloak from '../keycloak';
import { createUser } from '../../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- REDUCER ---
const initialState = {
    isAuthenticated: false,
    isLoading: true,
    userCreated: false,
    authSuccess: false,
    user: null
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'START_LOADING':
            return { ...state, isLoading: true };
        case 'STOP_LOADING':
            return { ...state, isLoading: false };
        case 'LOGIN_SUCCESS':
            if (!action.payload) {
                console.error('LOGIN_SUCCESS: payload is required');
                return state;
            }
            return { ...state, isAuthenticated: true, authSuccess: true, user: action.payload, isLoading: false };
        case 'LOGOUT':
            return { ...initialState, isLoading: false };
        case 'USER_CREATED':
            return { ...state, userCreated: true };
        case 'SET_USER':
            if (!action.payload) {
                console.error('SET_USER: payload is required');
                return state;
            }
            return { ...state, user: action.payload };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { isAuthenticated, isLoading, userCreated, authSuccess, user } = state;

    const applyUserData = () => {
        const tokenParsed = keycloak.tokenParsed;
        if (tokenParsed) {
            const tokenEdited = 
                user?.id !== tokenParsed?.user_id || 
                user?.username !== tokenParsed?.preferred_username || 
                user?.email !== tokenParsed?.email;
            if (tokenEdited) {
                dispatch({
                    type: 'SET_USER',
                    payload: {
                        id: tokenParsed?.user_id,
                        username: tokenParsed?.preferred_username,
                        email: tokenParsed?.email,
                        roles: tokenParsed?.realmAccess?.roles || []
                    }
                });
            }
        }
    };

    useEffect(() => {
        const initKeycloak = async () => {
            if (isAuthenticated) { 
                console.log('isAuthenticated == true - аутентификация не нужна или Keycloak уже инициализирован');
                return;
            }
            if (keycloak.didInitialize) {
                console.log("keycloak.didInitialize == true - aунтификация не нужна");
                console.warn("Почему-то keycloak.didInitialize == true, но isAuthenticated == false!")
            }

            try {
                await keycloak.init({
                    onLoad: 'check-sso',
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    checkLoginIframe: false,
                });

                keycloak.onTokenExpired = () => {
                    keycloak.updateToken(30)
                        .then((refreshed) => {
                            if (refreshed) {
                                console.log('Token был обновлен');
                                applyUserData();
                            } else {
                                console.log('Token все еще валидный');
                            }
                        })
                        .catch(() => {
                            console.log('Не удалось обновить token');
                            logout();
                        });
                };

                keycloak.onAuthLogout = () => logout();
                keycloak.onAuthError = () => logout();

                setupAtLogin();
            } catch (error) {
                console.error('Ошибка инициализации Keycloak:', error);
                logout();
            }
        };

        initKeycloak();

        return () => {
            keycloak.onTokenExpired = null;
            keycloak.onAuthLogout = null;
            keycloak.onAuthError = null;
        };
    }, [isAuthenticated]);

    const setupAtLogin = async () => {
        try {
            if (!keycloak.authenticated) {
                console.log('Пользователь не аутентифицирован (no sso)');
                logout();
                return;
            }

            const tokenParsed = keycloak.tokenParsed;
            if (!tokenParsed || !tokenParsed?.preferred_username || !tokenParsed?.email) {
                console.error('Неполные данные токена -> logout');
                logout();
                return;
            }

            applyUserData();

            if (!tokenParsed?.user_id) {
                console.log('Токен не содержит user_id -> создание пользователя');
                try {
                    const response = await createUser();
                    if (response?.status !== 200) throw new Error('Ошибка создания пользователя');
                    dispatch({ type: 'USER_CREATED' });
                } catch (error) {
                    console.error('Ошибка создания пользователя:', error);
                    logout('/errors/failedUserCreate.html');
                    return;
                }

                await forceTokenRefresh();

                if (!keycloak.tokenParsed?.user_id) {
                    console.error('user_id отсутствует даже после обновления токена -> logout');
                    logout();
                    return;
                }
            }

            dispatch({ type: 'LOGIN_SUCCESS', payload: keycloak.tokenParsed });
        } catch (error) {
            console.error('Ошибка при настройке аутентификации:', error);
            logout();
        }
    };

    const forceTokenRefresh = async () => {
        try {
            const refreshed = await keycloak.updateToken(-1);
            if (refreshed) console.log('Token refreshed successfully');
            else console.log('Token was not refreshed (still valid)');
            return keycloak.token;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            logout();
            throw error;
        }
    };

    const login = () => keycloak.login();

    const logout = (redirectPath = '') => {
        console.log('pre logout!');
        dispatch({ type: 'LOGOUT' });
        if (keycloak.authenticated) {
            const normalizedPath = redirectPath.startsWith("/") ? redirectPath : "/" + redirectPath;
            keycloak.logout({ redirectUri: window.location.origin + normalizedPath });
        }
    };

    const hasRole = (role) => keycloak.hasRealmRole(role);
    const getToken = () => keycloak.token;
    const updateToken = async (minValidity = 5) => keycloak.updateToken(minValidity);

    const value = {
        authSuccess,
        isAuthenticated,
        isLoading,
        user,
        userCreated,
        login,
        logout,
        hasRole,
        getToken,
        updateToken,
        keycloak
    };

    return (
        <AuthContext.Provider value={value}>
            {/* {authSuccess && children}
            {(isAuthenticated && isLoading) && <UserPreparationAfterRegistration />}
            {(!isAuthenticated && !isLoading) && <WelcomeScreen />} */}
            {typeof children === 'function' ? children(value) : children}
        </AuthContext.Provider>
    );
};
