// (C) 2019 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export enum AuthStatus {
    AUTHORIZING = "AUTHORIZING",
    AUTHORIZED = "AUTHORIZED",
    UNAUTHORIZED = "UNAUTHORIZED",
    LOGGING_IN = "LOGGING_IN",
    LOGGING_OUT = "LOGGING_OUT",
    REGISTERING = "REGISTERING",
}

export interface IAuthState {
    authStatus: AuthStatus;
    authError?: string | undefined;
}

export interface IAuthContext {
    authStatus: IAuthState["authStatus"];
    authError?: IAuthState["authError"];
    backend: IAnalyticalBackend;
    login: (username: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    register: () => Promise<void>;
}
