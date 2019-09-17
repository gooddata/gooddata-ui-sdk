import tigerFactory from "@gooddata/sdk-backend-tiger";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

let _BACKEND: IAnalyticalBackend;

export function initialize() {
    const username = process.env.REACT_APP_GD_USERNAME;
    const password = process.env.REACT_APP_GD_PASSWORD;

    _BACKEND = tigerFactory();

    if (username && password) {
        _BACKEND = _BACKEND.withCredentials(username, password);
    }
}

export function backend() {
    return _BACKEND;
}
