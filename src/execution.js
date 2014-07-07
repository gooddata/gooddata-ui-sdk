// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['xhr'], function(xhr) {
    'use strict';

    /**
     * Module for execution on experimental execution resource
     *
     * @class execution
     * @module execution
     */

    /**
     * For the given projectId it returns table structure with the given
     * elements in column headers.
     *
     * @method getData
     * @param {String} projectId - GD project identifier
     * @param {Array} elements - An array of attribute or metric identifiers.
     * @param {Object} executionConfiguration - Execution configuration - can contain for example
     *                 property "filters" containing execution context filters
     *                 property "where" containing query-like filters
     * @return {Object} Structure with `headers` and `rawData` keys filled with values from execution.
     */
    var getData = function(projectId, elements, executionConfiguration) {
        // Create request and result structures
        var request = {
            execution: {
                columns: elements
            }
        };

        // enrich configuration with supported properties such as
        // where clause with query-like filters or execution context filters
        executionConfiguration = executionConfiguration || {};
        ['filters', 'where'].forEach(function(property) {
            if (executionConfiguration[property]) {
                request.execution[property] = executionConfiguration[property];
            }
        });

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
            executedReport.rawData = (result && result.tabularDataResult) ? result.tabularDataResult.values : [];
            executedReport.isLoaded = true;
            d.resolve(executedReport);
        }, d.reject);

        return d.promise();
    };

    return {
        getData: getData
    };
});

