// (C) 2019 GoodData Corporation
import { useState } from "react";
import { IAuthState, AuthStatus } from "./types";

const initialState: IAuthState = {
    authStatus: AuthStatus.AUTHORIZING,
};

export const useAuthState = (initialAuthState: IAuthState = initialState) => {
    const [{ authStatus, authError }, setState] = useState<IAuthState>(initialAuthState);
    const onLoginStart = () =>
        setState({
            authStatus: AuthStatus.LOGGING_IN,
        });
    const onLoginSuccess = () =>
        setState({
            authStatus: AuthStatus.AUTHORIZED,
        });
    const onLoginError = (err: Error) =>
        setState({
            authStatus: AuthStatus.UNAUTHORIZED,
            authError: err.message,
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
    const onLogoutError = (err: Error) =>
        setState({
            authStatus: AuthStatus.UNAUTHORIZED,
            authError: err.message,
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
