// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import set = require("lodash/set");
interface ISdkCache {
    [apiCallId: string]: Promise<any>;
}

let gdcSdkCache = {};

function getSdkCache(): ISdkCache {
    return gdcSdkCache;
}

/**
 * Clears whole cache
 * Needs to be called manually on-demand
 *
 * @method clearSdkCache
 */
export function clearSdkCache() {
    if (gdcSdkCache) {
        gdcSdkCache = {};
    }
}

/**
 * Wraps some async call defined by onCacheMiss param and caches its result for next re-use.
 * If cached result is rejected it is removed from cache to unblock future calls
 *
 * @method getCachedOrLoad
 * @param {String} cacheKey - unique key to identify cached value
 * @param {Function} onCacheMiss - async function returning promise to call when value is not found in cache
 * @return {Promise} value from cache or result of onCacheMiss invocation
 */
export function getCachedOrLoad<T>(cacheKey: string, onCacheMiss: () => Promise<T>): Promise<T> {
    const sdkCache: ISdkCache = getSdkCache();
    const cachedResponse: Promise<T> = get<ISdkCache, keyof ISdkCache>(sdkCache, cacheKey);
    if (cachedResponse) {
        return cachedResponse;
    }
    const promise: Promise<T> = onCacheMiss();
    set(sdkCache, cacheKey, promise);

    promise.catch(() => {
        delete sdkCache.cacheKey;
    });
    return promise;
}
