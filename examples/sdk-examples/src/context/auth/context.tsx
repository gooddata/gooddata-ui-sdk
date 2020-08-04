// (C) 2019 GoodData Corporation
import React, { createContext, useContext, useEffect } from "react";
import bearFactory from "@gooddata/sdk-backend-bear";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { GoodDataAuthProvider } from "./GoodDataAuthProvider";
import { IAuthState, IAuthContext, AuthStatus } from "./types";
import { useAuthState } from "./state";

const noop = () => undefined;

const authProvider = new GoodDataAuthProvider();

const backend = bearFactory().withAuthentication(authProvider);

const initialState: IAuthState = {
    authStatus: AuthStatus.AUTHORIZING,
};

const defaultContext: IAuthContext = {
    ...initialState,
    backend,
    login: noop,
    logout: noop,
    register: noop,
};

export const AuthContext = createContext<IAuthContext>(defaultContext);

export const AuthProvider: React.FC = ({ children }) => {
    const {
        onLoginStart,
        onLoginSuccess,
        onLoginError,
        onLogoutStart,
        onLogoutSuccess,
        onLogoutError,
        onRegisterStart,
        onRegisterSuccess,
        onRegisterError,
        authStatus,
        authError,
    } = useAuthState(initialState);

    const login = async (username: string, password: string) => {
        onLoginStart();
        try {
            const result = await authProvider.login(username, password);
            onLoginSuccess();
            return result;
        } catch (err) {
            onLoginError(err);
            throw err;
        }
    };

    const logout = async () => {
        onLogoutStart();
        try {
            await authProvider.logout();
            onLogoutSuccess();
        } catch (err) {
            onLogoutError(err);
            throw err;
        }
    };

    const register = async (username: string, password: string, firstName: string, lastName: string) => {
        onRegisterStart();
        try {
            const result = await authProvider.register(username, password, firstName, lastName);
            onRegisterSuccess();
            return result;
        } catch (err) {
            onRegisterError(err);
            throw err;
        }
    };

    useEffect(() => {
        const auth = async () => {
            try {
                /**
                 * Authenticate force prop is needed to set to true in order
                 * for the login to be persisted after refreshing the page
                 */
                await backend.authenticate(true);
                onLoginSuccess();
            } catch (err) {
                // eslint-disable-next-line no-console
                console.log(err);
                onLogoutSuccess();
            }
        };

        auth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                authStatus,
                authError,
                login,
                logout,
                register,
                backend,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): IAuthContext => useContext(AuthContext);

export const useBackend = (): IAnalyticalBackend => {
    const { backend } = useAuth();
    return backend;
};
