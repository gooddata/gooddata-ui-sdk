// (C) 2019-2022 GoodData Corporation
import { useCallback, useState } from "react";
import { IAuthState, AuthStatus } from "./types";

const initialState: IAuthState = {
    authStatus: AuthStatus.AUTHORIZING,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAuthState = (initialAuthState: IAuthState = initialState) => {
    const [{ authStatus, authError }, setState] = useState<IAuthState>(initialAuthState);
    const onLoginStart = useCallback(
        () =>
            setState({
                authStatus: AuthStatus.LOGGING_IN,
            }),
        [],
    );
    const onLoginSuccess = useCallback(
        () =>
            setState({
                authStatus: AuthStatus.AUTHORIZED,
            }),
        [],
    );
    const onLoginError = useCallback(
        (err: Error) =>
            setState({
                authStatus: AuthStatus.UNAUTHORIZED,
                authError: err.message,
            }),
        [],
    );

    const onLogoutStart = useCallback(
        () =>
            setState({
                authStatus: AuthStatus.LOGGING_OUT,
            }),
        [],
    );
    const onLogoutSuccess = useCallback(
        () =>
            setState({
                authStatus: AuthStatus.UNAUTHORIZED,
                authError: undefined,
            }),
        [],
    );
    const onLogoutError = useCallback(
        // eslint-disable-next-line sonarjs/no-identical-functions
        (err: Error) =>
            setState({
                authStatus: AuthStatus.UNAUTHORIZED,
                authError: err.message,
            }),
        [],
    );

    const onRegisterStart = useCallback(
        () =>
            setState({
                authStatus: AuthStatus.REGISTERING,
            }),
        [],
    );
    const onRegisterSuccess = useCallback(
        // eslint-disable-next-line sonarjs/no-identical-functions
        () =>
            setState({
                authStatus: AuthStatus.UNAUTHORIZED,
                authError: undefined,
            }),
        [],
    );
    const onRegisterError = useCallback(
        // eslint-disable-next-line sonarjs/no-identical-functions
        (err: Error) =>
            setState({
                authStatus: AuthStatus.UNAUTHORIZED,
                authError: err.message,
            }),
        [],
    );

    return {
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
    };
};
