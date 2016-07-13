// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
/*eslint no-use-before-define: [2, "nofunc"]*/
import $ from 'jquery';
import * as config from './config';
import {
    isPlainObject,
    isFunction,
    isArray,
    merge,
    result
} from 'lodash';

/**
 * Ajax wrapper around GDC authentication mechanisms, SST and TT token handling and polling.
 * Inteface is same as original jQuery.ajax.

 * If token is expired, current request is "paused", token is refreshed and request is retried and result.
 * is transparently returned to original call.

 * Additionally polling is handled. Only final result of polling returned.
 * @module xhr
 * @class xhr
 */
let tokenRequest;
let xhrSettings; // TODO rename xhrSettings - "defaultXhrSettings?"

function enrichSettingWithCustomDomain(settings, domain) {
    if (domain) {
        // protect url to be prepended with domain on retry
        if (settings.url.indexOf(domain) === -1) {
            settings.url = domain + settings.url;
        }
        settings.xhrFields = settings.xhrFields || {};
        settings.xhrFields.withCredentials = true;
    }

    return settings;
}

function retryAjaxRequest(req, deferred) {
    // still use our extended ajax, because is still possible to fail recoverably in again
    // e.g. request -> 401 -> token renewal -> retry request -> 202 (polling) -> retry again after delay
    /*eslint-disable block-scoped-var*/ // we don't want to declare all functions inside ajax's fn scope
    ajax(req).done(function ajaxDone(data, textStatus, xhrObj) {
        deferred.resolve(data, textStatus, xhrObj);
    }).fail(function ajaxFail(xhrObj, textStatus, err) {
        deferred.reject(xhrObj, textStatus, err);
    });
    /*eslint-enable block-scoped-var*/
}

function continueAfterTokenRequest(req, deferred) {
    tokenRequest.done(function tokenRequestDone() {
        retryAjaxRequest(req, deferred);
    }).fail(function tokenRequestFail(xhrObj, textStatus, err) {
        if (xhrObj.status !== 401) {
            deferred.reject(xhrObj, textStatus, err);
        }
    });
}

function handleUnauthorized(req, deferred) {
    if (!tokenRequest) {
        // Create only single token request for any number of waiting request.
        // If token request exist, just listen for it's end.
        tokenRequest = $.ajax(enrichSettingWithCustomDomain({ url: '/gdc/account/token/' }, config.domain)).always(function alwayCb() {
            tokenRequest = null;
        }).fail(function failTokenRequest(xhrObj, textStatus, err) {
            // unauthorized when retrieving token -> not logged
            if ((xhrObj.status === 401) && (isFunction(req.unauthorized))) {
                req.unauthorized(xhrObj, textStatus, err, deferred);
                return;
            }
            // unauthorized handler is not defined or not http 401
            deferred.reject(xhrObj, textStatus, err);
        });
    }
    continueAfterTokenRequest(req, deferred);
}

function handlePolling(req, deferred) {
    const pollingDelay = result(req, 'pollDelay');

    setTimeout(function poller() {
        retryAjaxRequest(req, deferred);
    }, pollingDelay);
}

// helper to coverts traditional ajax callbacks to deferred
function reattachCallbackOnDeferred(settings, property, defferAttach) {
    const callback = settings[property];
    delete settings[property];
    if (isFunction(callback)) {
        defferAttach(callback);
    }
    if (isArray(callback)) {
        callback.forEach(function loopCallbacks(fn) {
            if (isFunction(callback)) {
                defferAttach(fn);
            }
        });
    }
}

/**
 * additional ajax configuration specific for xhr module, keys
 *   unauthorized: function(xhr) - called when user is unauthorized and token renewal failed
 *   pollDelay: int - polling interval in milliseconds, default 1000 - or generator function

 * method also accepts any option from original $.ajaxSetup. Options will be applied to all call of xhr.ajax().

 * xhrSetup behave similar tp $.ajaxSetup, each call replaces settings completely.
 * Options can be also passed to particular xhr.ajax calls (same as optios for $.ajax and $.ajaxSetup)
 * @method ajaxSetup
 */
export function ajaxSetup(settings) {
    xhrSettings = merge({
        contentType: 'application/json',
        dataType: 'json',
        pollDelay: 1000,
        headers: {
            'Accept': 'application/json; charset=utf-8'
        }
    }, settings);
}

/**
 * Same api as jQuery.ajax - arguments (url, settings) or (settings) with url inside
 * Additionally content type is automatically json, and object in settings.data is converted to string
 * to be consumed by GDC backend.

 * settings additionally accepts keys: unauthorized, pollDelay (see xhrSetup for more details)
 * @method ajax
 * @param url request url
 * @param settings settings object
 */
export function ajax(url, settings) {
    let finalSettings;
    let finalUrl;
    if (isPlainObject(url)) {
        finalSettings = url;
        finalUrl = undefined;
    } else {
        finalUrl = url;
        finalSettings = settings;
    }
    // copy settings to not modify passed object
    // settings can be undefined, doesn't matter, $.extend handle it
    finalSettings = merge({}, xhrSettings, finalSettings);
    if (finalUrl) {
        finalSettings.url = finalUrl;
    }

    if (isPlainObject(finalSettings.data)) {
        finalSettings.data = JSON.stringify(finalSettings.data);
    }

    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/
    reattachCallbackOnDeferred(finalSettings, 'success', d.done);
    reattachCallbackOnDeferred(finalSettings, 'error', d.fail);
    reattachCallbackOnDeferred(finalSettings, 'complete', d.always);

    if (tokenRequest) {
        continueAfterTokenRequest(finalSettings, d);
        return d;
    }

    $.ajax(enrichSettingWithCustomDomain(finalSettings, config.domain)).fail(function jqAjaxFail(xhrObj, textStatus, err) {
        if (xhrObj.status === 401) {
            handleUnauthorized(finalSettings, d);
        } else {
            d.reject(xhrObj, textStatus, err);
        }
    }).done(function jqAjaxDone(data, textStatus, xhrObj) {
        if (xhrObj.status === 202 && !finalSettings.dontPollOnResult) {
            // if the response is 202 and Location header is not empty, let's poll on the new Location
            const location = xhrObj.getResponseHeader('Location');
            if (location) {
                finalSettings.url = location;
            }
            finalSettings.method = 'GET';
            delete finalSettings.data;
            handlePolling(finalSettings, d);
        } else {
            d.resolve(data, textStatus, xhrObj);
        }
    });
    return d;
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
export const get = xhrMethod('GET');

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

// setup default settings
ajaxSetup({});

