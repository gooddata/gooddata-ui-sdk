// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
define(['jquery', './config'], function($, config) { 'use strict';

    /**
     * Ajax wrapper around GDC authentication mechanisms, SST and TT token handling and polling.
     * Inteface is same as original jQuery.ajax.

     * If token is expired, current request is "paused", token is refreshed and request is retried and result.
     * is transparently returned to original call.

     * Additionally polling is handled. Only final result of polling returned.
     * @module xhr
     * @class xhr
     */

    var tokenRequest,
        xhrSettings,
        xhr = {}; // returned module

    xhr.enrichSettingWithCustomDomain = function(settings, domain) {
        if (domain) {
            // protect url to be prepended with domain on retry
            if (settings.url.indexOf(domain) === -1) {
                settings.url = domain + settings.url;
            }
            settings.xhrFields = settings.xhrFields || {};
            settings.xhrFields.withCredentials = true;
        }

        return settings;
    };

    var retryAjaxRequest = function(req, deferred) {
        // still use our extended ajax, because is still possible to fail recoverably in again
        // e.g. request -> 401 -> token renewal -> retry request -> 202 (polling) -> retry again after delay
        xhr.ajax(req).done(function(data, textStatus, xhr) {
            deferred.resolve(data, textStatus, xhr);
        }).fail(function(xhr, textStatus, err) {
            deferred.reject(xhr, textStatus, err);
        });
    };

    var continueAfterTokenRequest = function(req, deferred) {
        tokenRequest.done(function() {
            retryAjaxRequest(req, deferred);
        }).fail(function(xhr, textStatus, err) {
            if (xhr.status !== 401) {
                deferred.reject(xhr, textStatus, err);
            }
        });
    };

    var handleUnauthorized = function(req, deferred) {
        if (!tokenRequest) {
            // Create only single token request for any number of waiting request.
            // If token request exist, just listen for it's end.
            tokenRequest = $.ajax(xhr.enrichSettingWithCustomDomain({ url: '/gdc/account/token/' }, config.domain)).always(function() {
                tokenRequest = null;
            }).fail(function(xhr, textStatus, err) {
                //unauthorized when retrieving token -> not logged
                if ((xhr.status === 401) && ($.isFunction(req.unauthorized))) {
                    req.unauthorized(xhr, textStatus, err, deferred);
                    return;
                }
                // unauthorized handler is not defined or not http 401
                deferred.reject(xhr, textStatus, err);
            });
        }
        continueAfterTokenRequest(req, deferred);
    };

    var handlePolling = function(req, deferred) {
        setTimeout(function() {
            retryAjaxRequest(req, deferred);
        }, req.pollDelay);
    };

    // helper to coverts traditional ajax callbacks to deferred
    var reattachCallbackOnDeferred = function(settings, property, defferAttach) {
        var callback = settings[property];
        delete settings[property];
        if ($.isFunction(callback)) {
            defferAttach(callback);
        }
        if ($.isArray(callback)) {
            callback.forEach(function(fn) {
                if ($.isFunction(callback)) {
                    defferAttach(fn);
                }
            });
        }
    };

    /**
     * additional ajax configuration specific for xhr module, keys
     *   unauthorized: function(xhr) - called when user is unathorized and token renewal failed
     *   pollDelay: int - polling interval in milisecodns, default 1000

     * method also accepts any option from original $.ajaxSetup. Options will be applied to all call of xhr.ajax().

     * xhrSetup behave similar tp $.ajaxSetup, each call replaces settings completely.
     * Options can be also passed to particular xhr.ajax calls (same as optios for $.ajax and $.ajaxSetup)
     * @method ajaxSetup
     */
    xhr.ajaxSetup = function(settings) {
        xhrSettings = $.extend({
            contentType: 'application/json',
            dataType: 'json',
            pollDelay: 1000,
            headers : {
                'Accept' : 'application/json; charset=utf-8'
            }
        }, settings);
    };

    /**
     * Same api as jQuery.ajax - arguments (url, settings) or (settings) with url inside
     * Additionally content type is automatically json, and object in settings.data is converted to string
     * to be consumed by GDC backend.

     * settings additionally accepts keys: unathorized, pollDelay  (see xhrSetup for more details)
     * @method ajax
     * @param url request url
     * @param settings settings object
     */
    xhr.ajax = function(url, settings) {
        if ($.isPlainObject(url)) {
            settings = url;
            url = undefined;
        }
        // copy settings to not modify passed object
        // settings can be undefined, doesn't matter, $.extend handle it
        settings = $.extend({}, xhrSettings, settings);
        if (url) {
            settings.url = url;
        }

        if ($.isPlainObject(settings.data)) {
            settings.data = JSON.stringify(settings.data);
        }

        var d = $.Deferred();
        reattachCallbackOnDeferred(settings, 'success', d.done);
        reattachCallbackOnDeferred(settings, 'error', d.fail);
        reattachCallbackOnDeferred(settings, 'complete', d.always);

        if (tokenRequest) {
            continueAfterTokenRequest(settings, d);
            return d;
        }

        $.ajax(xhr.enrichSettingWithCustomDomain(settings, config.domain)).fail(function(xhr, textStatus, err) {
            if (xhr.status === 401) {
                handleUnauthorized(settings, d);
            } else {
                d.reject(xhr, textStatus, err);
            }
        }).done(function(data, textStatus, xhr) {
            if (xhr.status === 202) {
                // if the response is 202 and Location header is not empty, let's poll on the new Location
                var location = xhr.getResponseHeader('Location');
                if (location){
                    settings.url = location;
                }
                handlePolling(settings, d);
            } else {
                d.resolve(data, textStatus, xhr);
            }
        });
        return d;
    };

    var xhrMethod = function xhrMethod(method) {
        return function(url, settings) {
            var opts = $.extend(true, {
                method: method
            }, settings);

            return xhr.ajax(url, opts);
        };
    };

    /**
     * Wrapper for xhr.ajax method GET
     * @method get
     */
    xhr.get = xhrMethod('GET');

    /**
     * Wrapper for xhr.ajax method POST
     * @method post
     */

    xhr.post = xhrMethod('POST');

    /**
     * Wrapper for xhr.ajax method PUT
     * @method put
     */
    xhr.put = xhrMethod('PUT');

    // setup default settings
    xhr.ajaxSetup({});
    return xhr;

});
