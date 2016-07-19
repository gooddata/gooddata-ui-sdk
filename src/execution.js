// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import $ from 'jquery';
import md5 from 'md5';

import {
    ajax,
    post
} from './xhr';

import Rules from './utils/rules';
import { sortDefinitions } from './utils/definitions';

import invariant from 'invariant';
import {
    compact,
    filter,
    first,
    find,
    map,
    every,
    get,
    isEmpty,
    isString,
    negate,
    last,
    assign,
    partial,
    flatten,
} from 'lodash';

const notEmpty = negate(isEmpty);

const findHeaderForMappingFn = (mapping, header) =>
    ((mapping.element === header.id || mapping.element === header.uri) && header.measureIndex === undefined);


const wrapMeasureIndexesFromMappings = (metricMappings, headers) => {
    if (metricMappings) {
        metricMappings.forEach((mapping) => {
            const header = find(headers, partial(findHeaderForMappingFn, mapping));
            if (header) {
                header.measureIndex = mapping.measureIndex;
                header.isPoP = mapping.isPoP;
            }
        });
    }
    return headers;
};

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
 * @param {Array} columns - An array of attribute or metric identifiers.
 * @param {Object} executionConfiguration - Execution configuration - can contain for example
 *                 property "filters" containing execution context filters
 *                 property "where" containing query-like filters
 *                 property "orderBy" contains array of sorted properties to order in form
 *                      [{column: 'identifier', direction: 'asc|desc'}]
 * @param {Object} settings - AJAX settings
 *
 * @return {Object} Structure with `headers` and `rawData` keys filled with values from execution.
 */
export function getData(projectId, columns, executionConfiguration = {}, settings = {}) {
    const executedReport = {
        isLoaded: false
    };

    // Create request and result structures
    const request = {
        execution: { columns }
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
    post(`/gdc/internal/projects/${projectId}/experimental/executions`, {
        ...settings,
        data: JSON.stringify(request)
    }, d.reject).then((result) => {
        executedReport.headers = wrapMeasureIndexesFromMappings(
            get(executionConfiguration, 'metricMappings'), result.executionResult.headers);

        // Start polling on url returned in the executionResult for tabularData
        return ajax(result.executionResult.tabularDataResult, settings);
    }, d.reject).then((result, message, response) => {
        // After the retrieving computed tabularData, resolve the promise
        executedReport.rawData = (result && result.tabularDataResult) ? result.tabularDataResult.values : [];
        executedReport.isLoaded = true;
        executedReport.isEmpty = (response.status === 204);
        d.resolve(executedReport);
    }, d.reject);

    return d.promise();
}

const MAX_TITLE_LENGTH = 255;
const getMetricTitle = (suffix, title) => {
    const maxLength = MAX_TITLE_LENGTH - suffix.length;
    if (title && title.length > maxLength) {
        if (title[title.length - 1] === ')') {
            return `${title.substring(0, maxLength - 2)}…)${suffix}`;
        }
        return `${title.substring(0, maxLength - 1)}…${suffix}`;
    }
    return `${title}${suffix}`;
};

const getBaseMetricTitle = partial(getMetricTitle, '');

const POP_SUFFIX = ' - previous year';
const getPoPMetricTitle = partial(getMetricTitle, POP_SUFFIX);

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
    const where = filter(map(get(item, 'measureFilters'), getFilterExpression), e => !!e);

    return 'SELECT ' + (aggregation ? `${aggregation}([${objectUri}])` : `[${objectUri}]`) +
        (notEmpty(where) ? ` WHERE ${where.join(' AND ')}` : '');
};

const getPercentMetricExpression = ({ category }, metricId) => {
    const attributeUri = get(category, 'attribute');

    return `SELECT (SELECT ${metricId}) / (SELECT ${metricId} BY ALL [${attributeUri}])`;
};

const getPoPExpression = (attribute, metricId) => {
    const attributeUri = get(attribute, 'attribute');

    return `SELECT (SELECT ${metricId}) FOR PREVIOUS ([${attributeUri}])`;
};

const getGeneratedMetricHash = (title, format, expression) => md5(`${expression}#${title}#${format}`);

const allFiltersEmpty = item => every(map(
    get(item, 'measureFilters', []),
    f => isEmpty(get(f, 'listAttributeFilter.default.attributeElements', []))
));

const getGeneratedMetricIdentifier = (item, aggregation, expressionCreator, hasher) => {
    const [, , , prjId, , id] = get(item, 'objectUri').split('/');
    const identifier = `${prjId}_${id}`;
    const hash = hasher(expressionCreator(item));
    const hasNoFilters = isEmpty(get(item, 'measureFilters', []));
    const type = get(item, 'type');

    const prefix = (hasNoFilters || allFiltersEmpty(item)) ? '' : 'filtered_';

    return `${type}_${identifier}.generated.${prefix}${aggregation}.${hash}`;
};

const isDerived = measure => {
    const type = get(measure, 'type');
    return (type === 'fact' || type === 'attribute' || !allFiltersEmpty(measure));
};

const isDateCategory = ({ category }) => category.type === 'date';
const isDateFilter = ({ dateFilter }) => dateFilter;

const getCategories = ({ categories }) => categories;
const getFilters = ({ filters }) => filters;

const getDateCategory = mdObj => {
    const category = find(getCategories(mdObj), isDateCategory);

    return get(category, 'category');
};

const getDateFilter = mdObj => {
    const dateFilter = find(getFilters(mdObj), isDateFilter);

    return get(dateFilter, 'dateFilter');
};

const getDate = mdObj => (getDateCategory(mdObj) || getDateFilter(mdObj));

const getMetricSort = (sort, isPoPMetric) => {
    if (isString(sort)) {
        // TODO: backward compatibility, remove when not used plain "sort: asc | desc" in measures
        return sort;
    }

    const sortByPoP = get(sort, 'sortByPoP');
    if ((isPoPMetric && sortByPoP) || (!isPoPMetric && !sortByPoP)) {
        return get(sort, 'direction');
    }
    return null;
};

const createPureMetric = (measure, mdObj, measureIndex) => ({
    element: get(measure, 'objectUri'),
    sort: getMetricSort(get(measure, 'sort')),
    meta: { measureIndex }
});

const createDerivedMetric = (measure, mdObj, measureIndex) => {
    const { format, sort } = measure;
    const title = getBaseMetricTitle(measure.title);

    const hasher = partial(getGeneratedMetricHash, title, format);
    const aggregation = get(measure, 'aggregation', 'base').toLowerCase();
    const element = getGeneratedMetricIdentifier(measure, aggregation, getGeneratedMetricExpression, hasher);
    const definition = {
        metricDefinition: {
            identifier: element,
            expression: getGeneratedMetricExpression(measure),
            title,
            format
        }
    };

    return {
        element,
        definition,
        sort: getMetricSort(sort),
        meta: {
            measureIndex
        }
    };
};

const createContributionMetric = (measure, mdObj, measureIndex) => {
    const category = first(getCategories(mdObj));

    let generated;
    let getMetricExpression = partial(getPercentMetricExpression, category, `[${get(measure, 'objectUri')}]`);
    if (isDerived(measure)) {
        generated = createDerivedMetric(measure, mdObj, measureIndex);
        getMetricExpression = partial(getPercentMetricExpression, category, `{${get(generated, 'definition.metricDefinition.identifier')}}`);
    }
    const title = getBaseMetricTitle(get(measure, 'title'));
    const hasher = partial(getGeneratedMetricHash, title, CONTRIBUTION_METRIC_FORMAT);
    const result = [{
        element: getGeneratedMetricIdentifier(measure, 'percent', getMetricExpression, hasher),
        definition: {
            metricDefinition: {
                identifier: getGeneratedMetricIdentifier(measure, 'percent', getMetricExpression, hasher),
                expression: getMetricExpression(measure),
                title,
                format: CONTRIBUTION_METRIC_FORMAT
            }
        },
        sort: getMetricSort(get(measure, 'sort')),
        meta: {
            measureIndex
        }
    }];

    if (generated) {
        result.unshift({ definition: generated.definition });
    }

    return result;
};

const createPoPMetric = (measure, mdObj, measureIndex) => {
    const title = getPoPMetricTitle(get(measure, 'title'));
    const format = get(measure, 'format');
    const hasher = partial(getGeneratedMetricHash, title, format);

    const date = getDate(mdObj);

    let generated;
    let getMetricExpression = partial(getPoPExpression, date, `[${get(measure, 'objectUri')}]`);

    if (isDerived(measure)) {
        generated = createDerivedMetric(measure, mdObj, measureIndex);
        getMetricExpression = partial(getPoPExpression, date, `{${get(generated, 'definition.metricDefinition.identifier')}}`);
    }

    const identifier = getGeneratedMetricIdentifier(measure, 'pop', getMetricExpression, hasher);

    const result = [{
        element: identifier,
        definition: {
            metricDefinition: {
                identifier,
                expression: getMetricExpression(),
                title,
                format
            }
        },
        sort: getMetricSort(get(measure, 'sort'), true),
        meta: {
            measureIndex,
            isPoP: true
        }
    }];

    if (generated) {
        result.push(generated);
    } else {
        result.push(createPureMetric(measure, mdObj, measureIndex));
    }

    return result;
};

const createContributionPoPMetric = (measure, mdObj, measureIndex) => {
    const date = getDate(mdObj);

    const generated = createContributionMetric(measure, mdObj, measureIndex);
    const title = getPoPMetricTitle(get(measure, 'title'));

    const format = CONTRIBUTION_METRIC_FORMAT;
    const hasher = partial(getGeneratedMetricHash, title, format);

    const getMetricExpression = partial(getPoPExpression, date, `{${last(generated).element}}`);

    const identifier = getGeneratedMetricIdentifier(measure, 'pop', getMetricExpression, hasher);

    const result = [{
        element: identifier,
        definition: {
            metricDefinition: {
                identifier,
                expression: getMetricExpression(),
                title,
                format
            }
        },
        sort: getMetricSort(get(measure, 'sort'), true),
        meta: {
            measureIndex,
            isPoP: true
        }
    }];

    result.push(generated);

    return flatten(result);
};

const categoryToElement = ({ category }) =>
    ({ element: get(category, 'displayForm'), sort: get(category, 'sort') });

const attributeFilterToWhere = f => {
    const elements = get(f, 'listAttributeFilter.default.attributeElements', []);
    const elementsForQuery = map(elements, e => ({ id: last(e.split('=')) }));

    const dfUri = get(f, 'listAttributeFilter.displayForm');
    const negative = get(f, 'listAttributeFilter.default.negativeSelection');

    return negative ?
        { [dfUri]: { '$not': { '$in': elementsForQuery } } } :
        { [dfUri]: { '$in': elementsForQuery } };
};

const dateFilterToWhere = f => {
    const dateUri = get(f, 'dateFilter.dimension') || get(f, 'dateFilter.dataset');
    const granularity = get(f, 'dateFilter.granularity');
    const between = [get(f, 'dateFilter.from'), get(f, 'dateFilter.to')];
    return { [dateUri]: { '$between': between, '$granularity': granularity } };
};

const isPoP = ({ showPoP }) => showPoP;
const isContribution = ({ showInPercent }) => showInPercent;

const isCalculatedMeasure = ({ type }) => type === 'metric';

const rules = new Rules();

rules.addRule(
    [isPoP, isContribution],
    createContributionPoPMetric
);

rules.addRule(
    [isPoP],
    createPoPMetric
);

rules.addRule(
    [isContribution],
    createContributionMetric
);

rules.addRule(
    [isDerived],
    createDerivedMetric
);

rules.addRule(
    [isCalculatedMeasure],
    createPureMetric
);

function getMetricFactory(measure) {
    const factory = rules.match(measure);

    invariant(factory, `Unknown factory for: ${measure}`);

    return factory;
}

const isDateFilterExecutable = dateFilter =>
    get(dateFilter, 'from') !== undefined &&
    get(dateFilter, 'to') !== undefined;

const isAttributeFilterExecutable = listAttributeFilter =>
    notEmpty(get(listAttributeFilter, ['default', 'attributeElements']));


function getWhere(filters) {
    const attributeFilters = map(filter(filters, ({ listAttributeFilter }) => isAttributeFilterExecutable(listAttributeFilter)), attributeFilterToWhere);
    const dateFilters = map(filter(filters, ({ dateFilter }) => isDateFilterExecutable(dateFilter)), dateFilterToWhere);

    return [...attributeFilters, ...dateFilters].reduce(assign, {});
}

const sortToOrderBy = item => ({ column: get(item, 'element'), direction: get(item, 'sort') });

const getOrderBy = (metrics, categories, type) => {
    // For bar chart we always override sorting to sort by values (first metric)
    if (type === 'bar' && notEmpty(metrics)) {
        return [{
            column: first(compact(map(metrics, 'element'))),
            direction: 'desc'
        }];
    }

    return map(filter([...categories, ...metrics], item => item.sort), sortToOrderBy);
};

export const mdToExecutionConfiguration = (mdObj, options = {}) => {
    const buckets = get(mdObj, 'buckets');
    const measures = map(buckets.measures, ({ measure }) => measure);
    const metrics = flatten(map(measures, (measure, index) => getMetricFactory(measure)(measure, buckets, index)));

    let categories = getCategories(buckets);
    let filters = getFilters(buckets);
    if (options.removeDateItems) {
        categories = filter(categories, ({ category }) => category.type !== 'date');
        filters = filter(filters, item => !item.dateFilter);
    }
    categories = map(categories, categoryToElement);

    const columns = compact(map([...categories, ...metrics], 'element'));

    return {
        columns,
        orderBy: getOrderBy(metrics, categories, get(mdObj, 'type')),
        definitions: sortDefinitions(compact(map(metrics, 'definition'))),
        where: columns.length ? getWhere(filters) : {},
        metricMappings: map(metrics, m => ({ element: m.element, ...m.meta }))
    };
};

export const getDataForVis = (projectId, mdObj, settings) => {
    const { columns, ...executionConfiguration } = mdToExecutionConfiguration(mdObj);
    return getData(projectId, columns, executionConfiguration, settings);
};
