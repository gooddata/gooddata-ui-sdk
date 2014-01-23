// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
// # GDC SDK
// now it can log you in, return execution result
// from raw resource and return valid elements for
// attribute
(function (name, context, definition) {
      if (typeof module != 'undefined' && module.exports) module.exports = definition()
      else if (typeof define == 'function' && define.amd) define(definition)
      else context[name] = definition()
})('sdk', this, function () {

    // `emptyReportDefinition` documents structure of payload our executor accepts
    // so for now, we have to mangle data into this form
    // This empty object serves as a template which is **cloned**
    // and filled with element data as needed
    var emptyReportDefinition = {
        "reportDefinition":{
            "content":{
                "filters":[],
                "format":"grid",
                "grid":{
                    "rows":[],
                    "columns":[],
                    "sort":{
                    "columns":[],
                    "rows":[]
                    },
                    "columnWidths":[],
                    "metrics":[]
                }
            },
            "meta":{
                "title":"Test",
                "summary":"",
                "tags":"",
                "deprecated":0,
                "category":"reportDefinition"
            }
        }
    };

    // Transforms array of elements (metrics and attributes)
    // into structure *executor* accepts
    //
    // basically what we construct here is `reportDefinition` of
    // grid which has everything in columns
    //
    // **BEWARE** - it will change
    var getReportDefinition = function(elements) {
        var currentMetrics = elements.filter(function(element) {
            return element.type === 'metric';
        });

        var currentAttributes = elements.filter(function(element) {
            return element.type === 'attribute';
        });

        // Deep clone `emptyReportDefinition` to fill with data
        var reportDef = $.extend(true, {}, emptyReportDefinition);

        var grid = reportDef.reportDefinition.content.grid;

        grid.metrics = currentMetrics.map(function(metric) {
            return {
                uri: metric.uri,
                alias: ''
            };
        });

        // everything is in columns
        grid.columns = currentAttributes.map(function(attribute) {
            return {
                attribute: {
                    alias: '',
                    totals:[[],[]],
                    uri: attribute.uri
                }
            };
        // if we have any metrics, we need to include `"metricGroup"` property
        }).concat(currentMetrics.length ? ["metricGroup"] : []);

        return reportDef;
    };

    // Returns a promise which either:
    //  * **resolves** - which means user is logged in or
    //  * **rejects** - meaning is not logged in
    var isLoggedIn = function() {
        return $.getJSON('/gdc/account/token');
    };

    // Authenticate to GDC api
    //
    // `username` and `password` are you credentials in GDC platform
    // No remembering or captcha for now
    var login = function(username, password) {
        var d = $.Deferred();

        // for local development, use login+password to staging
        xhr.post("/gdc/account/login", {
            data: JSON.stringify({
                postUserLogin: {
                    login: username,
                    password: password,
                    remember: 1,
                    captcha: "",
                    verifyCaptcha: ""
                }
            })
        }).then(d.resolve, d.reject);

        return d.promise();
    };

    /**
     * For the given projectId it returns table structure with the given
     * elements in column headers.
     * @param projectId
     * @param elements An array of attribute or metric identifiers.
     * @return Structure with 'headers' and 'rawData' keys filled with values from execution.
     */
    var getData = function(projectId, elements) {
        // Create request and result structures
        var request = {
            execution: {
                columns: elements
            }
        };
        var executedReport = {
            isLoaded: false
        };
        // create empty promise-like Ember.Object
        var d = $.Deferred();

        // Execute request
        xhr.post('/gdc/internal/projects/'+projectId+'/experimental/executions', {
            data: JSON.stringify(request)
        }, d.reject).then(function(result) {
            // Populate result's header section
            executedReport.headers = result.executionResult.columns.map(function(col) {
                if (col.attributeDisplayForm) {
                    return {
                        type: 'attrLabel',
                        id: col.attributeDisplayForm.meta.identifier,
                        uri: col.attributeDisplayForm.meta.uri,
                        title: col.attributeDisplayForm.meta.title
                    };
                } else {
                    return {
                        type: 'metric',
                        id: col.metric.meta.identifier,
                        title: col.metric.meta.title,
                        format: col.metric.content.format
                    };
                }
            });
            // Start polling on url returned in the executionResult for tabularData
            return xhr.ajax(result.executionResult.tabularDataResult);
        }, d.reject).then(function(result) {
            // After the retrieving computed tabularData, resolve the promise
            executedReport.rawData = result.tabularDataResult.values;
            executedReport.isLoaded = true;
            d.resolve(executedReport);
        }, d.reject);

        return d.promise();
    };

    // Get additional information about elements specified by their uris
    // `elementUris` is the array of uris of elements to be look-up
    // Currently makes a request for each object, should be encapsulated
    // to one call
    var getElementDetails = function(elementUris) {
        var d = $.Deferred();

        var fns = elementUris.map(function(uri) {
            return xhr.ajax(uri);
        });

        $.when.apply(this, fns).done(function() {
            // arguments is the array of resolved
            var args = Array.prototype.slice.call(arguments);

            var enriched = args.map(function(element) {
                var root = element[0];
                if (root.attributeDisplayForm) {
                    return {
                        type: 'attribute',
                        uri: root.attributeDisplayForm.meta.uri,
                        formOf: root.attributeDisplayForm.content.formOf,
                        name: root.attributeDisplayForm.meta.title
                    };
                } else if (root.metric) {
                    return {
                        type: 'metric',
                        uri: root.metric.meta.uri,
                        name: root.metric.meta.title
                    };
                }
            });

            // override titles with related attribute title
            var uri2fn = {};
            var ids = {};

            var indi = [], i = 0;

            var fns = [];

            enriched.forEach(function(el, idx) {
                if (el.formOf) {
                    fns.push(xhr.ajax(el.formOf));
                    ids[el.uri] = idx;
                    indi[i++] = idx;
                }
            });

            // all formOf are executed
            $.when.apply(this, fns).done(function() {
                var args = Array.prototype.slice.call(arguments);

                args.forEach(function(arg, idx) {
                    // get element to owerwrite
                    var which = indi[idx];
                    var update = enriched[which];

                    update.name = arg[0].attribute.meta.title;
                });

                d.resolve(enriched);
            });

        });
        return d.promise();
    };

    var getValidElements = function(element) {
        var data = Em.Object.create({
            isLoaded: false,
            elementItems: undefined
        });

        xhr.post(element.uri+'/validElements?order=asc', {
            data: JSON.stringify({validElementsRequest: {uris: []}})
        }).then(function(result) {
            data.setProperties({
                isLoaded: true,
                elementItems: result.validElements.items
            });
        });
        return data;
    };

    var getCurrentProjectId = function() {
        var d = $.Deferred();

        xhr.get('/gdc/app/account/bootstrap').then(function(result) {
            var uri = result.bootstrapResource.current.project.links.self;
            d.resolve(uri.split('/').pop());
        }, d.reject);

        return d.promise();
    };

    return {
        isLoggedIn: isLoggedIn,
        login: login,
        getData: getData,
        getValidElements: getValidElements,
        getReportDefinition: getReportDefinition,
        getCurrentProjectId: getCurrentProjectId
    };
});

// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
(function (name, context, definition) {
      if (typeof module != 'undefined' && module.exports) module.exports = definition()
      else if (typeof define == 'function' && define.amd) define(definition)
      else context[name] = definition()
})('xhr', this, function () {
    // Ajax wrapper around GDC authentication mechanisms, SST and TT token handling and polling.
    // Inteface is same as original jQuery.ajax.

    // If token is expired, current request is "paused", token is refreshed and request is retried and result.
    // is transparently returned to original call.

    // Additionally polling is handled. Only final result of polling returned.
    var tokenRequest,
        xhrSettings,
        xhr = {}; // returned module

    var retryAjaxRequest = function(req, deffered) {
        // still use our extended ajax, because is still possible to fail recoverably in again
        // e.g. request -> 401 -> token renewal -> retry request -> 202 (polling) -> retry again after delay
        xhr.ajax(req).done(function(data, textStatus, xhr) {
            deffered.resolve(data, textStatus, xhr);
        }).fail(function(xhr, textStatus, err) {
            deffered.reject(xhr, textStatus, err);
        });
    };

    var continueAfterTokenRequest = function(req, deffered) {
        tokenRequest.done(function() {
            retryAjaxRequest(req, deffered);
        }).fail(function(xhr, textStatus, err) {
            if (xhr.status !== 401) {
                deffered.reject(xhr, textStatus, err);
            }
        });
    };

    var handleUnauthorized = function(req, deffered) {
        if (!tokenRequest) {
            // Create only single token request for any number of waiting request.
            // If token request exist, just listen for it's end.
            tokenRequest = $.ajax('/gdc/account/token/').always(function() {
                tokenRequest = null;
            }).fail(function(xhr, textStatus, err) {
                //unauthorized when retrieving token -> not logged
                if ((xhr.status === 401) && ($.isFunction(req.unauthorized))) {
                    req.unauthorized(xhr);
                    return;
                }
                // unauthorized handler is not defined or not http 401
                deffered.reject(xhr, textStatus, err);
            });
        }
        continueAfterTokenRequest(req, deffered);
    };

    var handlePolling = function(req, deffered) {
        setTimeout(function() {
            retryAjaxRequest(req, deffered);
        }, req.pollDelay);
    };

    // helper to coverts traditional ajax callbacks to deffered
    var reattachCallbackOnDeffered = function(settings, property, defferAttach) {
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

    // additional ajax configuration specific for xhr module, keys
    //   unauthorized: function(xhr) - called when user is unathorized and token renewal failed
    //   pollDelay: int - polling interval in milisecodns, default 1000
    //
    // method also accepts any option from original $.ajaxSetup. Options will be applied to all call of xhr.ajax().
    //
    // xhrSetup behave similar tp $.ajaxSetup, each call replaces settings completely.
    // Options can be also passed to particular xhr.ajax calls (same as optios for $.ajax and $.ajaxSetup)
    xhr.ajaxSetup = function(settings) {
        xhrSettings = $.extend({
            contentType: 'application/json',
            dataType: 'json',
            pollDelay: 1000
        }, settings);
    };

    // Same api as jQuery.ajax - arguments (url, settings) or (settings) with url inside
    // Additionally content type is automatically json, and object in settings.data is converted to string
    // to be consumed by GDC backend.
    //
    // settings additionally accepts keys: unathorized, pollDelay  (see xhrSetup for more details)
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
        reattachCallbackOnDeffered(settings, 'success', d.done);
        reattachCallbackOnDeffered(settings, 'error', d.fail);
        reattachCallbackOnDeffered(settings, 'complete', d.always);

        if (tokenRequest) {
            continueAfterTokenRequest(settings, d);
            return d;
        }
        $.ajax(settings).fail(function(xhr, textStatus, err) {
            if (xhr.status === 401) {
                handleUnauthorized(settings, d);
            } else {
                d.reject(xhr, textStatus, err);
            }
        }).done(function(data, textStatus, xhr) {
            if (xhr.status === 202) {
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
        }
    };

    xhr.get = xhrMethod('GET');
    xhr.post = xhrMethod('POST');

    // setup dafault settings
    xhr.ajaxSetup({});
    return xhr;

});
