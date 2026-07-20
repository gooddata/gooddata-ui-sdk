// (C) 2019-2026 GoodData Corporation

import globalAxios, { type AxiosInstance, type CreateAxiosDefaults } from "axios";
import { type AxiosCacheInstance, setupCache } from "axios-cache-interceptor";
import { cloneDeep, merge } from "lodash-es";

import { LIB_NAME, LIB_VERSION } from "./__version.js";

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

// For now we dont customize caching as we rely on Cache-Control headers from the BE services
const DEFAULT_CACHE_CONFIG = {};

/**
 * Returns an instance of axios with default configuration.
 */
export const axios: AxiosInstance = setupCache(globalAxios.create(_CONFIG), DEFAULT_CACHE_CONFIG);

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
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
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
    return setupCache(globalAxios.create(config), DEFAULT_CACHE_CONFIG);
}

// Every instance created by this module is wrapped with axios-cache-interceptor, so it
// carries a `storage`. The guard keeps the public surface as a plain AxiosInstance.
function isAxiosCacheInstance(instance: AxiosInstance): instance is AxiosCacheInstance {
    return "storage" in instance;
}

/**
 * Clears the entire in-memory response cache of an axios instance created by {@link newAxios}.
 *
 * Every axios instance created by this module is wrapped with `axios-cache-interceptor`, which
 * caches GET responses based on server Cache-Control headers (and, for header-less responses,
 * a default TTL). After a write (PUT, PATCH, POST action, DELETE) a subsequent GET may return a
 * stale cached body. This bulk clear is the safe-but-blunt remedy: it drops all cached GETs, so
 * any following read hits the server. Prefer {@link removeAxiosResponseCacheEntries} when the
 * set of reads invalidated by a write is known and bounded.
 *
 * @param axiosInstance - an axios instance created by {@link newAxios}
 * @public
 */
export async function clearAxiosResponseCache(axiosInstance: AxiosInstance): Promise<void> {
    if (isAxiosCacheInstance(axiosInstance) && axiosInstance.storage.clear) {
        await axiosInstance.storage.clear();
    }
}

/**
 * Removes specific entries from the in-memory response cache of an axios instance created by
 * {@link newAxios}, leaving every other cached GET intact.
 *
 * Each id must match the cache id under which the corresponding GET response was stored. The
 * default key generator derives the id from the request `method`, `baseURL`, `url`, `params` and
 * `data`; to make a read's id stable and known up front, pass an explicit `id` on the GET request
 * config (the id then becomes the cache key verbatim) and reuse that same id here after the write.
 *
 * Use this for targeted read-after-write invalidation where the write→read mapping is known and
 * complete. When coverage is uncertain, fall back to {@link clearAxiosResponseCache}.
 *
 * @param axiosInstance - an axios instance created by {@link newAxios}
 * @param ids - cache ids of the entries to remove
 * @public
 */
export async function removeAxiosResponseCacheEntries(
    axiosInstance: AxiosInstance,
    ids: readonly string[],
): Promise<void> {
    if (!isAxiosCacheInstance(axiosInstance)) {
        return;
    }
    for (const id of ids) {
        await axiosInstance.storage.remove(id);
    }
}
