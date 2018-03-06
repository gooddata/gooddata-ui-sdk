// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
import {
    isPlainObject,
    isFunction,
    has,
    set,
    merge,
    result
} from 'lodash';

import fetch from './utils/fetch';

/**
 * Ajax wrapper around GDC authentication mechanisms, SST and TT token handling and polling.
 * Inteface is same as original jQuery.ajax.

 * If token is expired, current request is "paused", token is refreshed and request is retried and result.
 * is transparently returned to original call.

 * Additionally polling is handled. Only final result of polling returned.
 * @module xhr
 * @class xhr
 */

const DEFAULT_POLL_DELAY = 1000;

function simulateBeforeSend(settings, url) {
    const xhr = {
        setRequestHeader(key, value) {
            set(settings, ['headers', key], value);
        }
    };

    if (isFunction(settings.beforeSend)) {
        settings.beforeSend(xhr, url);
    }
}

function enrichSettingWithCustomDomain(originalUrl, originalSettings, domain) {
    let url = originalUrl;
    const settings = originalSettings;
    if (domain) {
        // protect url to be prepended with domain on retry
        if (originalUrl.indexOf(domain) === -1) {
            url = domain + originalUrl;
        }
        settings.mode = 'cors';
        settings.credentials = 'include';
    }

    return { url, settings };
}

function isLoginRequest(url) {
    return url.indexOf('/gdc/account/login') !== -1;
}

/**
 * @param {Response} response
 * @return {Promise} promise which resolves to result JSON ()
 */
export const parseJSON = response => response.json();

/**
 * @param {Response} response see https://developer.mozilla.org/en-US/docs/Web/API/Response
 * @return {Response} or {Error}
 */
const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 399) {
        return response;
    }

    if (response instanceof Error && has(response, 'response')) {
        throw response;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
};

export function handlePolling(url, settings, sendRequest) {
    const pollingDelay = result(settings, 'pollDelay');

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            sendRequest(url, settings).then(resolve, reject);
        }, pollingDelay);
    });
}

export function createModule(config) {
    let commonXhrSettings = {};
    let tokenRequest;

    function createSettings(customSettings) {
        const settings = merge(
            {
                headers: {
                    Accept: 'application/json; charset=utf-8',
                    'Content-Type': 'application/json'
                }
            },
            commonXhrSettings,
            customSettings
        );

        settings.pollDelay = (settings.pollDelay !== undefined) ? settings.pollDelay : DEFAULT_POLL_DELAY;

        // TODO jquery compat - add to warnings
        settings.body = (settings.data) ? settings.data : settings.body;
        settings.mode = 'same-origin';
        settings.credentials = 'same-origin';

        if (isPlainObject(settings.body)) {
            settings.body = JSON.stringify(settings.body);
        }

        return settings;
    }
    /**
     * Back compatible method for setting common XHR settings
     *
     * Usually in our apps we used beforeSend ajax callback to set the X-GDC-REQUEST header with unique ID.
     *
     * @param settings object XHR settings as
     */
    function ajaxSetup(settings) {
        commonXhrSettings = Object.assign({}, commonXhrSettings, settings);
    }

    function continueAfterTokenRequest(url, settings) {
        return tokenRequest.then((response) => {
            if (!response.ok) {
                const err = new Error('Unauthorized');
                err.response = response;
                throw err;
            }
            tokenRequest = null;

            return ajax(url, settings); // eslint-disable-line no-use-before-define
        }, (reason) => {
            tokenRequest = null;
            return reason;
        });
    }

    function handleUnauthorized(originalUrl, originalSettings) {
        if (!tokenRequest) {
            // Create only single token request for any number of waiting request.
            // If token request exist, just listen for it's end.
            const { url, settings } = enrichSettingWithCustomDomain('/gdc/account/token', createSettings({}), config.getDomain());

            tokenRequest = fetch(url, settings).then((response) => {
                // tokenRequest = null;
                // TODO jquery compat - allow to attach unauthorized callback and call it if attached
                // if ((xhrObj.status === 401) && (isFunction(req.unauthorized))) {
                //     req.unauthorized(xhrObj, textStatus, err, deferred);
                //     return;
                // }
                // unauthorized handler is not defined or not http 401
                // unauthorized when retrieving token -> not logged
                if (response.status === 401) {
                    const err = new Error('Unauthorized');
                    err.response = response;
                    throw err;
                }

                return response;
            });
        }
        return continueAfterTokenRequest(originalUrl, originalSettings);
    }

    function ajax(originalUrl, tempSettings = {}) {
        const firstSettings = createSettings(tempSettings);
        const { url, settings } = enrichSettingWithCustomDomain(originalUrl, firstSettings, config.getDomain());

        simulateBeforeSend(settings, url);

        if (tokenRequest) {
            return continueAfterTokenRequest(url, settings);
        }

        return fetch(url, settings).then((response) => {
            // If response.status id 401 and it was a login request there is no need
            // to cycle back for token - login does not need token and this meant you
            // are not authorized
            if (response.status === 401) {
                if (isLoginRequest(url)) {
                    const err = new Error('Unauthorized');
                    err.response = response;
                    throw err;
                }

                return handleUnauthorized(url, settings);
            }

            if (response.status === 202 && !settings.dontPollOnResult) {
                // poll on new provided url, fallback to the original one
                // (for example validElements returns 303 first with new url which may then return 202 to poll on)
                let finalUrl = response.url || url;

                const finalSettings = settings;

                // if the response is 202 and Location header is not empty, let's poll on the new Location
                if (response.headers.has('Location')) {
                    finalUrl = response.headers.get('Location');
                }
                finalSettings.method = 'GET';
                delete finalSettings.data;
                delete finalSettings.body;

                return handlePolling(finalUrl, finalSettings, ajax);
            }
            return response;
        }).then(checkStatus);
    }

    /**
     * Wrapper for xhr.ajax method GET
     * @method get
     */
    const get = (url, settings) => {
        const opts = merge({ method: 'GET' }, settings);
        return ajax(url, opts).then(parseJSON);
    };

    function xhrMethod(method) {
        return function methodFn(url, settings) {
            const opts = merge({ method }, settings);

            return ajax(url, opts);
        };
    }

    /**
     * Wrapper for xhr.ajax method POST
     * @method post
     */
    const post = xhrMethod('POST');

    /**
     * Wrapper for xhr.ajax method PUT
     * @method put
     */
    const put = xhrMethod('PUT');

    /**
     * Wrapper for xhr.ajax method DELETE
     * @method delete
     */
    const del = xhrMethod('DELETE');

    return {
        get,
        post,
        put,
        del,
        ajax,
        ajaxSetup,
        parseJSON
    };
}
