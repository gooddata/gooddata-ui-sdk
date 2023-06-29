// (C) 2019-2022 GoodData Corporation
import globalAxios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import cloneDeep from "lodash/cloneDeep.js";
import merge from "lodash/merge.js";
import { LIB_VERSION, LIB_NAME } from "./__version.js";

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
const _CONFIG: CreateAxiosDefaults = {
    maxContentLength: -1,
    withCredentials: true,
    headers: {
        common: {
            "X-Requested-With": "XMLHttpRequest",
            "X-GDC-JS-PACKAGE": LIB_NAME,
            "X-GDC-JS-PACKAGE-VERSION": LIB_VERSION,
        },
        post: {
            "Content-Type": "application/json;charset=utf8",
        },
        put: {
            "Content-Type": "application/json;charset=utf8",
        },
    },
};

let _TOKEN: string | undefined;

/**
 * Returns an instance of axios with default configuration.
 */
export const axios: AxiosInstance = globalAxios.create(_CONFIG);

/**
 * This function sets global API token to send in Authorization header on all API calls done by axios. If the token is
 * undefined then no Authorization header will be sent.
 *
 * Make your code obtain the token as you see fit (for instance from env variable available in CLI tool) and set
 * it before calling {@link newAxios}.
 *
 * Note: this setting WILL NOT reflect any existing `AxiosInstance`s. It will be in effect for all new
 * instances created by calling {@link newAxios}.
 *
 * @param token - token to set; if undefined to
 * @public
 */
export function setGlobalAuthorizationToken(token: string | undefined) {
    _TOKEN = token;
}

/**
 * Sets or clears Authorization token to use in the provided axios instance. If the token is provided,
 * then it will be used in `common` Authorization header which will be sent on all requests.
 *
 * If the token is undefined, the common Authorization header setting will be removed from axios config.
 *
 * @param axios - an instance of axios to update with authorization token
 * @param token - token to set or undefined to clear
 * @public
 */
export function setAxiosAuthorizationToken(axios: AxiosInstance, token: string | undefined) {
    if (!token) {
        delete axios.defaults.headers.common["Authorization"];
    } else {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
}

/**
 * Creates a new configuration for axios. The factory allows to override baseUrl (e.g. tiger hostname) and to
 * merge-in additional headers. If the global authorization token is set, it will automatically include the token.
 *
 * @param baseUrl - hostname to use, if not specified then axios (in browser) works on top of current origin
 * @param headers - header settings, merged into axios' headers object
 * @public
 */
export function newAxiosRequestConfig(
    baseUrl?: string,
    headers?: { [name: string]: string },
): CreateAxiosDefaults {
    const config: CreateAxiosDefaults = cloneDeep(_CONFIG);

    if (baseUrl) {
        config.baseURL = baseUrl;
    }

    if (_TOKEN) {
        config.headers!.common = {
            Authorization: `Bearer ${_TOKEN}`,
        };
    }

    if (headers) {
        config.headers = merge(config.headers, headers);
    }

    return config;
}

/**
 * Creates a new instance of axios.
 *
 * @param baseUrl - hostname, optional, will default to current origin
 * @param headers - object mapping header name → header value
 * @returns always new instance
 * @public
 */
export function newAxios(baseUrl?: string, headers?: { [name: string]: string }): AxiosInstance {
    const config = newAxiosRequestConfig(baseUrl, headers);

    return globalAxios.create(config);
}
