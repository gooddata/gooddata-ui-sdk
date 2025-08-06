// (C) 2022-2025 GoodData Corporation

import React, { createContext, useContext, useEffect, useState } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { createBackend } from "./backend";
import { useAuthState, initialState, IAuthInitialState } from "./state";

const noop = (): Promise<void> => Promise.resolve();

export interface IAuthContext extends IAuthInitialState {
    backend: IAnalyticalBackend;
    authError?: string;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const defaultContext: IAuthContext = {
    ...initialState,
    backend: createBackend(),
    login: noop,
    logout: noop,
};

export const AuthContext = createContext<IAuthContext>(defaultContext);

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const {
        onLoginStart,
        onLoginSuccess,
        onLoginError,
        onLogoutStart,
        onLogoutSuccess,
        onLogoutError,
        authStatus,
        authError,
    } = useAuthState(initialState);

    const [backend, setBackend] = useState(defaultContext.backend);

    const login = async () => {
        onLoginStart();
        try {
            const newBackend = createBackend();
            await newBackend.authenticate();
            setBackend(newBackend);
            onLoginSuccess();
        } catch (err: any) {
            onLoginError(err);
            throw err;
        }
    };

    const logout = async () => {
        onLogoutStart();
        try {
            await backend.deauthenticate();
            onLogoutSuccess();
        } catch (err: any) {
            onLogoutError(err);
            throw err;
        }
    };

    useEffect(() => {
        const auth = async () => {
            try {
                await backend.authenticate();
                onLoginSuccess();
            } catch {
                // we do not care about the error in this context
                onLoginError();
            }
        };

        auth().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider
            value={{
                authStatus,
                authError,
                backend,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const useBackend = () => {
    const { backend: backendFromAuth } = useAuth();
    return backendFromAuth;
};
