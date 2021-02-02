// (C) 2019-2021 GoodData Corporation
import a, { AxiosInstance, AxiosRequestConfig } from "axios";

/**
 * Default config from axios sets request headers:
 *
 * For all methods:
 *  Accept: application/json, text/html
 *
 * For POST and PUT of JS objects (isObject):
 *  Content-Type: application/json;charset=utf8
 *
 * Setting default Content-Type to application/json;charset=utf - will be sent regardless of data as the
 * backend can only accept JSON anyway.
 */
const _CONFIG: AxiosRequestConfig = {
    maxContentLength: -1,
    headers: {
        post: {
            "Content-Type": "application/json;charset=utf8",
        },
        put: {
            "Content-Type": "application/json;charset=utf8",
        },
    },
};

/**
 * Returns an instance of axios with default configuration.
 */
export const axios: AxiosInstance = a.create(_CONFIG);

/**
 * Creates a new instance of axios.
 *
 * @param baseUrl - hostname, optional, will default to current origin
 * @param headers - object mapping header name -\> header value
 * @returns always new instance
 */
export function newAxios(baseUrl?: string, headers?: { [name: string]: string }): AxiosInstance {
    const config: AxiosRequestConfig = _CONFIG;

    if (baseUrl) {
        config.baseURL = baseUrl;
    }

    if (headers) {
        config.headers = {
            common: headers,
            ...config.headers,
        };
    }

    return a.create(config);
}
