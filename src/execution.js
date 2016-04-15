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
import find from 'lodash/collection/find';
import partial from 'lodash/function/partial';
import pluck from 'lodash/collection/pluck';
import identity from 'lodash/utility/identity';
import flatten from 'lodash/array/flatten';
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
    }, d.reject).then(function resolveDataResultPolling(result, message, response) {
        // After the retrieving computed tabularData, resolve the promise
        executedReport.rawData = (result && result.tabularDataResult) ? result.tabularDataResult.values : [];
        executedReport.isLoaded = true;
        executedReport.isEmpty = (response.status === 204);
        d.resolve(executedReport);
    }, d.reject);

    return d.promise();
}

const CONTRIBUTION_METRIC_FORMAT = '#,##0.00%';

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

const getGeneratedMetricExpression = item => {
    const aggregation = get(item, 'aggregation', '').toUpperCase();
    const objectUri = get(item, 'objectUri');
    const where = filter(map(get(item, 'metricAttributeFilters'), getFilterExpression), e => !!e);

    return 'SELECT ' + (aggregation ? `${aggregation}([${objectUri}])` : `[${objectUri}]`) +
        (notEmpty(where) ? ` WHERE ${where.join(' AND ')}` : '');
};

const getPercentMetricExpression = (attribute, metricId) => {
    const attributeUri = get(attribute, 'attribute');

    return `SELECT (SELECT ${metricId}) / (SELECT ${metricId} BY ALL [${attributeUri}])`;
};

const getPoPExpression = (attribute, metricId) => {
    const attributeUri = get(attribute, 'attribute');

    return `SELECT (SELECT ${metricId}) FOR PREVIOUS ([${attributeUri}])`;
};

const getGeneratedMetricHash = (title, format, expression) => md5(`${expression}#${title}#${format}`);

const allFiltersEmpty = item => every(map(
    get(item, 'metricAttributeFilters', []),
    f => isEmpty(get(f, 'listAttributeFilter.default.attributeElements', []))
));

const getGeneratedMetricIdentifier = (item, aggregation, expressionCreator, hasher) => {
    const [, , , prjId, , id] = get(item, 'objectUri').split('/');
    const identifier = `${prjId}_${id}`;
    const hash = hasher(expressionCreator(item));
    const hasNoFilters = isEmpty(get(item, 'metricAttributeFilters', []));
    const type = get(item, 'type');

    const prefix = (hasNoFilters || allFiltersEmpty(item)) ? '' : 'filtered_';

    return `${type}_${identifier}.generated.${prefix}${aggregation}.${hash}`;
};

const generatedMetricDefinition = item => {
    const { title, format } = item;

    const hasher = partial(getGeneratedMetricHash, title, format);
    const aggregation = get(item, 'aggregation', 'base').toLowerCase();
    const element = getGeneratedMetricIdentifier(item, aggregation, getGeneratedMetricExpression, hasher);
    const definition = {
        metricDefinition: {
            identifier: element,
            expression: getGeneratedMetricExpression(item),
            title,
            format
        }
    };

    return { element, definition };
};

const isDerivedMetric = (item) => {
    const type = get(item, 'type');
    return (type === 'fact' || type === 'attribute' || !allFiltersEmpty(item));
};

const contributionMetricDefinition = (attribute, item) => {
    let generated;
    let getMetricExpression = partial(getPercentMetricExpression, attribute, `[${get(item, 'objectUri')}]`);
    if (isDerivedMetric(item)) {
        generated = generatedMetricDefinition(item);
        getMetricExpression = partial(getPercentMetricExpression, attribute, `{${get(generated, 'definition.metricDefinition.identifier')}}`);
    }
    const title = `% ${get(item, 'title')}`.replace(/^(% )+/, '% ');
    const hasher = partial(getGeneratedMetricHash, title, CONTRIBUTION_METRIC_FORMAT);
    const result = [{
        element: getGeneratedMetricIdentifier(item, 'percent', getMetricExpression, hasher),
        definition: {
            metricDefinition: {
                identifier: getGeneratedMetricIdentifier(item, 'percent', getMetricExpression, hasher),
                expression: getMetricExpression(item),
                title,
                format: CONTRIBUTION_METRIC_FORMAT
            }
        }
    }];

    if (generated) {
        result.unshift({ definition: generated.definition });
    }

    return result;
};

const getDate = date => get(date, 'dateFilterSettings', date);

const popMetricDefinition = (attribute, item) => {
    const title = `${get(item, 'title')} - previous year`;
    const format = get(item, 'format');
    const hasher = partial(getGeneratedMetricHash, title, format);

    const date = getDate(attribute);

    let generated;
    let getMetricExpression = partial(getPoPExpression, date, `[${get(item, 'objectUri')}]`);

    if (isDerivedMetric(item)) {
        generated = generatedMetricDefinition(item);
        getMetricExpression = partial(getPoPExpression, date, `{${get(generated, 'definition.metricDefinition.identifier')}}`);
    }

    const identifier = getGeneratedMetricIdentifier(item, 'pop', getMetricExpression, hasher);

    const result = [{
        element: identifier,
        definition: {
            metricDefinition: {
                identifier,
                expression: getMetricExpression(),
                title,
                format
            }
        }
    }];

    if (generated) {
        result.push(generated);
    }

    return result;
};

const contributionPoPMetricDefinition = (date, attribute, item) => {
    const generated = contributionMetricDefinition(attribute ? attribute : date, item);

    const title = `% ${get(item, 'title')} - previous year`.replace(/^(% )+/, '% ');
    const format = CONTRIBUTION_METRIC_FORMAT;
    const hasher = partial(getGeneratedMetricHash, title, format);

    const getMetricExpression = partial(getPoPExpression, getDate(date), `{${last(generated).element}}`);

    const identifier = getGeneratedMetricIdentifier(item, 'pop', getMetricExpression, hasher);

    const result = [{
        element: identifier,
        definition: {
            metricDefinition: {
                identifier,
                expression: getMetricExpression(),
                title,
                format
            }
        }
    }];

    result.push(generated);

    return flatten(result);
};

const categoryToElement = c => ({ element: get(c, 'displayForm') });

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

const dateFilterToWhere = f => {
    const dimensionUri = get(f, 'dateFilterSettings.dimension');
    const granularity = get(f, 'dateFilterSettings.granularity');
    const between = [get(f, 'dateFilterSettings.from'), get(f, 'dateFilterSettings.to')];
    return { [dimensionUri]: { '$between': between, '$granularity': granularity } };
};

const metricToDefinition = metric => ({ element: get(metric, 'objectUri') });

export const mdToExecutionConfiguration = (mdObj) => {
    const { filters } = mdObj;
    const measures = map(mdObj.measures, ({measure}) => measure);
    const categories = map(mdObj.categories, ({category}) => category);
    const attributes = map(categories, categoryToElement);
    const contributionMetrics = map(
        filter(measures, m => m.showInPercent && !m.showPoP),
        partial(contributionMetricDefinition, find(categories, c => c.type === 'attribute' || c.type === 'date'))
    );

    const date = find([].concat(categories, filters), c => (c.type === 'date' || c.dateFilterSettings));

    const popMetrics = map(
        filter(measures, m => m.showPoP && !m.showInPercent),
        partial(popMetricDefinition, date)
    );
    const contributionPoPMetrics = map(
        filter(measures, m => m.showPoP && m.showInPercent),
        partial(contributionPoPMetricDefinition, date, find(categories, c => c.type === 'attribute' || c.type === 'date'))
    );
    const factMetrics = map(filter(measures, m => m.type === 'fact' && !m.showInPercent && !m.showPoP), generatedMetricDefinition);
    const metrics = map(filter(measures, m => m.type === 'metric' && !m.showInPercent), metric => {
        if (isEmpty(metric.metricAttributeFilters)) {
            return metricToDefinition(metric);
        }

        return generatedMetricDefinition(metric);
    });
    const attributeMetrics = map(filter(measures, m => m.type === 'attribute' && !m.showInPercent && !m.showPoP), generatedMetricDefinition);
    const attributeFilters = map(filter(filters, ({ listAttributeFilter }) => listAttributeFilter !== undefined), attributeFilterToWhere);
    const dateFilters = map(filter(filters, ({ dateFilterSettings }) => dateFilterSettings !== undefined), dateFilterToWhere);

    const allMetrics = [].concat(
        attributes,
        factMetrics,
        attributeMetrics,
        flatten(popMetrics),
        metrics,
        flatten(contributionMetrics),
        flatten(contributionPoPMetrics)
    );

    const where = [].concat(attributeFilters, dateFilters).reduce(assign, {});

    return { execution: {
        columns: filter(pluck(allMetrics, 'element'), identity),
        where,
        definitions: filter(pluck(allMetrics, 'definition'), identity)
    } };
};

export const getDataForVis = (projectId, mdObj) => {
    const { execution } = mdToExecutionConfiguration(get(mdObj, 'buckets'));
    const { columns, ...executionConfiguration } = execution;
    return getData(projectId, columns, executionConfiguration);
};
