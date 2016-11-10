// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
/*eslint block-scoped-var:0 no-use-before-define: [2, "nofunc"]*/ // TODO enable block-scoped-vars
import * as config from './config';
import {
    isPlainObject,
    isFunction,
    has,
    merge
} from 'lodash';
import 'isomorphic-fetch';

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

let tokenRequest;
let commonXhrSettings = {};

/**
 * Back compatible method for setting common XHR settings
 *
 * Usually in our apps we used beforeSend ajax callback to set the X-GDC-REQUEST header with unique ID.
 *
 * @param settings object XHR settings as
 */
export function ajaxSetup(settings) {
    commonXhrSettings = Object.assign({}, commonXhrSettings, settings);
}

function simulateBeforeSend(settings) {
    const xhr = {
        setRequestHeader(key, value) {
            settings.headers.set(key, value);
        }
    };

    if (isFunction(settings.beforeSend)) {
        settings.beforeSend(xhr);
    }
}

function enrichSettingWithCustomDomain(originalUrl, settings, domain) {
    let url = originalUrl;
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

function continueAfterTokenRequest(url, settings) {
    return tokenRequest.then(response => {
        if (!response.ok) {
            const err = new Error('Unauthorized');
            err.response = response;
            throw err;
        }
        tokenRequest = null;

        return ajax(url, settings);
    }, reason => {
        tokenRequest = null;
        return reason;
    });
}

function handleUnauthorized(originalUrl, originalSettings) {
    if (!tokenRequest) {
        // Create only single token request for any number of waiting request.
        // If token request exist, just listen for it's end.
        const { url, settings } = enrichSettingWithCustomDomain('/gdc/account/token', createSettings({}), config.domain);

        tokenRequest = fetch(url, settings).then(response => {
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

function isLoginRequest(url) {
    return url.indexOf('/gdc/account/login') !== -1;
}

/**
 * @param {Response} response
 * @return {Promise} promise which resolves to result JSON ()
 */
export const parseJSON = (response) => response.json();

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

export function ajax(originalUrl, tempSettings = {}) {
    const firstSettings = createSettings(tempSettings);
    const { url, settings } = enrichSettingWithCustomDomain(originalUrl, firstSettings, config.domain);

    simulateBeforeSend(settings);

    if (tokenRequest) {
        return continueAfterTokenRequest(url, settings);
    }

    return fetch(url, settings).then(response => {
        // If response.status id 401 and it was a login request there is no need
        // to cycle back for token - login does not need token and this meand you
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
            // if the response is 202 and Location header is not empty, let's poll on the new Location
            let finalUrl = url;
            const finalSettings = settings;
            if (response.headers.has('Location')) {
                finalUrl = response.headers.get('Location');
            }
            finalSettings.method = 'GET';
            delete finalSettings.data;
            delete finalSettings.body;
            return handlePolling(finalUrl, finalSettings);
        }
        return response;
    }).then(checkStatus);
}

function createSettings(customSettings) {
    const headers = new Headers({
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json'
    });

    const settings = Object.assign({}, commonXhrSettings, customSettings);

    settings.pollDelay = (settings.pollDelay !== undefined) ? settings.pollDelay : DEFAULT_POLL_DELAY;

    settings.headers = headers;

    // TODO jquery compat - add to warnings
    settings.body = (settings.data) ? settings.data : settings.body;
    settings.mode = 'same-origin';
    settings.credentials = 'same-origin';

    if (isPlainObject(settings.body)) {
        settings.body = JSON.stringify(settings.body);
    }

    return settings;
}

function handlePolling(url, settings) {
    return new Promise((resolve, reject) => {
        setTimeout(function poller() {
            ajax(url, settings).then(resolve, reject);
        }, settings.pollDelay);
    });
}
function xhrMethod(method) {
    return function methodFn(url, settings) {
        const opts = merge({ method }, settings);

        return ajax(url, opts);
    };
}

/**
 * Wrapper for xhr.ajax method GET
 * @method get
 */
export const get = (url, settings) => {
    const opts = merge({ method: 'GET' }, settings);

    return ajax(url, opts).then(parseJSON);
};

/**
 * Wrapper for xhr.ajax method POST
 * @method post
 */
export const post = xhrMethod('POST');

/**
 * Wrapper for xhr.ajax method PUT
 * @method put
 */
export const put = xhrMethod('PUT');

