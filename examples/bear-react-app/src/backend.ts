import bearFactory from "@gooddata/sdk-backend-bear";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

let _BACKEND: IAnalyticalBackend;

export function initialize() {
    const username = process.env.REACT_APP_GD_USERNAME;
    const password = process.env.REACT_APP_GD_PASSWORD;

    _BACKEND = bearFactory();

    if (username && password) {
        _BACKEND = _BACKEND.withCredentials(username, password);
    }
}

export function backend() {
    return _BACKEND;
}
