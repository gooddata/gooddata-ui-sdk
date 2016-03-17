// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import $ from 'jquery';
import { ajax, post } from './xhr';
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
 *                 property "orderBy" contains array of sorted properties to order in form
 *                      [{column: 'identifier', direction: 'asc|desc'}]
 *
 * @return {Object} Structure with `headers` and `rawData` keys filled with values from execution.
 */
export function getData(projectId, elements, executionConfiguration) {
    // Create request and result structures
    const request = {
        execution: {
            columns: elements
        }
    };
    const executedReport = {
        isLoaded: false
    };

    // enrich configuration with supported properties such as
    // where clause with query-like filters or execution context filters
    const config = executionConfiguration || {};
    ['filters', 'where', 'orderBy', 'definitions'].forEach(function assignProperties(property) {
        if (config[property]) {
            request.execution[property] = config[property];
        }
    });
    // create empty promise-like Ember.Object
    /*eslint-disable new-cap*/
    const d = $.Deferred();
    /*eslint-enable new-cap*/

    // Execute request
    post('/gdc/internal/projects/' + projectId + '/experimental/executions', {
        data: JSON.stringify(request)
    }, d.reject).then(function resolveSimpleExecution(result) {
        // TODO: when executionResult.headers will be globaly available columns map code should be removed
        if (result.executionResult.headers) {
            executedReport.headers = result.executionResult.headers;
        } else {
            // Populate result's header section if is not available
            executedReport.headers = result.executionResult.columns.map(function mapColsToHeaders(col) {
                if (col.attributeDisplayForm) {
                    return {
                        type: 'attrLabel',
                        id: col.attributeDisplayForm.meta.identifier,
                        uri: col.attributeDisplayForm.meta.uri,
                        title: col.attributeDisplayForm.meta.title
                    };
                }
                return {
                    type: 'metric',
                    id: col.metric.meta.identifier,
                    uri: col.metric.meta.uri,
                    title: col.metric.meta.title,
                    format: col.metric.content.format
                };
            });
        }
        // Start polling on url returned in the executionResult for tabularData
        return ajax(result.executionResult.tabularDataResult);
    }, d.reject).then(function resolveDataResultPolling(result, message, response) {
        // After the retrieving computed tabularData, resolve the promise
        executedReport.rawData = (result && result.tabularDataResult) ? result.tabularDataResult.values : [];
        executedReport.isLoaded = true;
        executedReport.isEmpty = (response.status === 204);
        d.resolve(executedReport);
    }, d.reject);

    return d.promise();
}

