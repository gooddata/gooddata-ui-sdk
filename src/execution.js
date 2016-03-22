// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import $ from 'jquery';
import { ajax, post } from './xhr';
import md5 from 'md5';
import filter from 'lodash/collection/filter';
import map from 'lodash/collection/map';
import every from 'lodash/collection/every';
import get from 'lodash/object/get';
import isEmpty from 'lodash/lang/isEmpty';
import negate from 'lodash/function/negate';
import last from 'lodash/array/last';
import assign from 'lodash/object/assign';
const notEmpty = negate(isEmpty);
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
export function getData(projectId, elements, executionConfiguration = {}) {
    const executedReport = {
        isLoaded: false
    };

    // Create request and result structures
    const request = {
        execution: {
            columns: elements
        }
    };
    // enrich configuration with supported properties such as
    // where clause with query-like filters or execution context filters
    ['filters', 'where', 'orderBy', 'definitions'].forEach(property => {
        if (executionConfiguration[property]) {
            request.execution[property] = executionConfiguration[property];
        }
    });

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
    }, d.reject).then(function resolveDataResultPolling(result) {
        // After the retrieving computed tabularData, resolve the promise
        executedReport.rawData = (result && result.tabularDataResult) ? result.tabularDataResult.values : [];
        executedReport.isLoaded = true;
        d.resolve(executedReport);
    }, d.reject);

    return d.promise();
}

const getFilterExpression = listAttributeFilter => {
    const attributeUri = get(listAttributeFilter, 'listAttributeFilter.attribute');
    const elements = get(listAttributeFilter, 'listAttributeFilter.default.attributeElements', []);
    if (isEmpty(elements)) {
        return null;
    }
    const elementsForQuery = map(elements, e => `[${e}]`);
    const negative = get(listAttributeFilter, 'listAttributeFilter.default.negativeSelection') ? 'NOT ' : '';

    return `[${attributeUri}] ${negative}IN (${elementsForQuery.join(',')})`;
};

const getFactMetricExpression = factMetric => {
    const aggregation = get(factMetric, 'aggregation', '').toUpperCase();
    const objectUri = get(factMetric, 'objectUri');
    const where = filter(map(get(factMetric, 'metricAttributeFilters'), getFilterExpression), e => !!e);

    return 'SELECT ' + (aggregation ? `${aggregation}([${objectUri}])` : `[${objectUri}]`) +
        (notEmpty(where) ? ` WHERE ${where.join(' AND ')}` : '');
};

const getFactMetricHash = expression => md5(expression);

const getFactMetricIdentifier = factMetric => {
    const aggregation = get(factMetric, 'aggregation', 'base');
    const [, , , prjId, , id] = get(factMetric, 'objectUri').split('/');
    const identifier = `${prjId}_${id}`;
    const hash = getFactMetricHash(getFactMetricExpression(factMetric));
    const hasNoFilters = isEmpty(get(factMetric, 'metricAttributeFilters', []));
    const allFiltersEmpty = every(map(
        get(factMetric, 'metricAttributeFilters', []),
        f => isEmpty(get(f, 'listAttributeFilter.default.attributeElements', []))
    ));

    const prefix = (hasNoFilters || allFiltersEmpty) ? '' : 'filtered_';

    return `fact_${identifier}.generated.${prefix}${aggregation.toLowerCase()}.${hash}`;
};

const factMetricToDefinition = factMetric => {
    const element = getFactMetricIdentifier(factMetric);
    const definition = {
        metricDefinition: {
            identifier: getFactMetricIdentifier(factMetric),
            expression: getFactMetricExpression(factMetric),
            title: get(factMetric, 'title'),
            format: get(factMetric, 'format')
        }
    };

    return { element, definition };
};

const categoryToElement = c => {
    return { element: get(c, 'displayForm') };
};

const attributeFilterToWhere = f => {
    const dfUri = get(f, 'listAttributeFilter.displayForm');
    const elements = get(f, 'listAttributeFilter.default.attributeElements', []);
    const elementsForQuery = map(elements, e => ({
        id: last(e.split('='))
    }));
    const negative = get(f, 'listAttributeFilter.default.negativeSelection') ? 'NOT ' : '';

    return negative ?
        { [dfUri]: { '$not': { '$in': elementsForQuery } } } :
        { [dfUri]: { '$in': elementsForQuery } };
};

const metricToDefinition = metric => ({ element: get(metric, 'objectUri')});

export const mdToExecutionConfiguration = (mdObj) => {
    const { measures, categories, filters } = mdObj;
    const factMetrics = map(filter(measures, m => m.type === 'fact'), factMetricToDefinition);
    const metrics = map(filter(measures, m => m.type === 'metric'), metricToDefinition);
    const attributes = map(filter(categories, c => c.collection = 'attribute'), categoryToElement);
    const attributeFilters = map(filters, attributeFilterToWhere);

    const columns = [];
    const definitions = [];
    factMetrics.forEach(({element, definition}) => {
        columns.push(element);
        definitions.push(definition);
    });
    metrics.forEach(({element}) => columns.push(element));
    attributes.forEach(({element}) => columns.push(element));
    const where = attributeFilters.reduce((acc, f) => {
        return assign(acc, f);
    }, {});
    return { 'execution': { columns, where, definitions } };
};

export const getDataForVis = (projectId, mdObj) => {
    const { execution } = mdToExecutionConfiguration(get(mdObj, 'buckets'));
    const { columns, ...executionConfiguration } = execution;
    return getData(projectId, columns, executionConfiguration);
};

