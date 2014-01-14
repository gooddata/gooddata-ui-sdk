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
        xhr.ajax("/gdc/account/login", {
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
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

    // **getRawData** calls executor with reportDefinition of `elements`
    // it returns `jQuery.Deferred`'s promise object
    //
    // (**TODO** separate steps to functions)
    var getRawData = function(projectId, elements) {

        // create report definition payload from elements
        var r = getReportDefinition(elements);

        // create empty promise-like Ember.Object
        var d = $.Deferred();

        // Here we create reportDefinition in metadata server
        xhr.ajax('/gdc/md/'+projectId+'/obj?createAndGet=true', {
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(r)
        // with reportDefinition from MD server in `result`
        // we execute report
        //
        // now we send only `reportDefinition` uri which will
        // be necessary to change after removing persistent reportDefinions
        }, d.reject).then(function(result) {
            return xhr.ajax('/gdc/projects/'+projectId+'/execute/raw', {
                type: 'post',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({"report_req":{"reportDefinition": result.reportDefinition.meta.uri }})
            });
        // with `dataResult` uri in `result` we
        // issue request for data.
        // This request is not resolved immediately on server
        // and uses polling therefore.
        }, d.reject).then(function(result) {
            return xhr.ajax(result.uri);
        // here we finally have data in `result` so we just
        // resolve our promise
        }, d.reject).then(d.resolve, d.reject);
        return d.promise();
    };


    // TODO: this should be a top-level wrapper on top of the resource
    // we'll have. It should provide data in a convenient way for all widgets
    // in a sanely structured way
    // TODO: export this function at the bottom of this file
    var getData = function() {

    };

    var getTableData = function(projectId, elements) {
        var d = $.Deferred();
        var rawDataPromise = getRawData(projectId, elements).then(function(result) {
            $.csv.toArrays(result, {}, function(err, parsed) {
                var data = {
                    headers: parsed.shift().map(function(header) {
                        var element = elements.filter(function(e) {
                            return e.name === header;
                        })[0];
                        return {
                            title: header,
                            uri: element.uri
                        };
                    }),
                    rawData: parsed,
                    isLoaded: true
                };
                d.resolve(data);
            });
            return d;
        });
        return rawDataPromise;
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


    var getTableDataFromSimpleElements = function(projectId, elements) {
        // enrich elements
        var d = $.Deferred();

        getElementDetails(elements).then(function(enriched) {
            getTableData(projectId, enriched).then(function(tableData) {
                d.resolve(tableData);
            });
        });

        // call
        return d.promise();
    };

    var getValidElements = function(element) {
        var data = Em.Object.create({
            isLoaded: false,
            elementItems: undefined
        });

        xhr.ajax(element.uri+'/validElements?order=asc', {
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
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

        xhr.ajax('/gdc/app/account/bootstrap', {
            type: 'get',
            contentType: 'application/json',
            dataType: 'json'
        }).then(function(result) {
            var uri = result.bootstrapResource.current.project.links.self;
            d.resolve(uri.split('/').pop());
        }, d.reject);

        return d.promise();
    };

    return {
        isLoggedIn: isLoggedIn,
        login: login,
        getTableData: getTableData,
        getTableDataFromSimpleElements: getTableDataFromSimpleElements,
        getRawData: getRawData,
        getValidElements: getValidElements,
        getReportDefinition: getReportDefinition,
        getCurrentProjectId: getCurrentProjectId
    };
});

