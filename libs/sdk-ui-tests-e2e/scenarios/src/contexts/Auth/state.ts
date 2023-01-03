// (C) 2022 GoodData Corporation

import { useState } from "react";

export type IAuthStatus = "AUTHORIZING" | "AUTHORIZED" | "UNAUTHORIZED" | "LOGGING_IN" | "LOGGING_OUT";

export const AuthStatus: { [key: string]: IAuthStatus } = {
    AUTHORIZING: "AUTHORIZING",
    AUTHORIZED: "AUTHORIZED",
    UNAUTHORIZED: "UNAUTHORIZED",
    LOGGING_IN: "LOGGING_IN",
    LOGGING_OUT: "LOGGING_OUT",
};

export interface IAuthInitialState {
    authStatus: IAuthStatus;
}

export interface IAuthState extends IAuthInitialState {
    authError?: string;
}

export const initialState: IAuthInitialState = {
    authStatus: AuthStatus.AUTHORIZING,
};

export const useAuthState = (initialState: IAuthState) => {
    const [{ authStatus, authError }, setState] = useState(initialState);
    const onLoginStart = () =>
        setState({
            authStatus: AuthStatus.LOGGING_IN,
        });
    const onLoginSuccess = () =>
        setState({
            authStatus: AuthStatus.AUTHORIZED,
        });
    const onLoginError = (err?: Error) =>
        setState({
            authStatus: AuthStatus.UNAUTHORIZED,
            authError: err?.message,
        });

    const onLogoutStart = () =>
        setState({
            authStatus: AuthStatus.LOGGING_OUT,
        });
    const onLogoutSuccess = () =>
        setState({
            authStatus: AuthStatus.UNAUTHORIZED,
            authError: undefined,
        });
    // eslint-disable-next-line sonarjs/no-identical-functions
    const onLogoutError = (err?: Error) =>
        setState({
            authStatus: AuthStatus.UNAUTHORIZED,
            authError: err?.message,
        });

    return {
        onLoginStart,
        onLoginSuccess,
        onLoginError,
        onLogoutStart,
        onLogoutSuccess,
        onLogoutError,
        authStatus,
        authError,
    };
};
