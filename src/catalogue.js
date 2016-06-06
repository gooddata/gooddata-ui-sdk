import { get, fromPairs, trim, find, omit } from 'lodash';
import * as xhr from './xhr';
import { mdToExecutionConfiguration } from './execution';

const SELECT_LENGTH = 'SELECT '.length;
const REQUEST_DEFAULTS = {
    types: ['attribute', 'metric', 'fact'],
    paging: {
        offset: 0
    }
};
const LOAD_DATE_DATASET_DEFAULTS = {
    includeUnavailableDateDataSetsCount: true,
    includeAvailableDateAttributes: true
};

const parseCategories = (bucketItems) => (
    get(bucketItems, 'categories').map(({ category }) => ({
            category: {
                ...category,
                displayForm: get(category, 'attribute')
            }
        })
    )
);

function bucketItemsToExecConfig(bucketItems) {
    const categories = parseCategories(bucketItems);
    const executionConfig = mdToExecutionConfiguration({
        buckets: {
            ...bucketItems,
            categories
        }
    });
    const definitions = get(executionConfig, 'execution.definitions');
    const idToExpr = fromPairs(definitions.map(
        ({ metricDefinition }) =>
            [metricDefinition.identifier, metricDefinition.expression] ));

    return get(executionConfig, 'execution.columns').map(column => {
        const definition = find(definitions, ({ metricDefinition }) =>
            get(metricDefinition, 'identifier') === column
        );
        const maql = get(definition, 'metricDefinition.expression');

        if (maql) {
            return maql.replace(/{[^}]+}/g, (match) => {
                const expression = idToExpr[trim(match, '{}')];
                return expression.substr(SELECT_LENGTH);
            });
        }
        return column;
    });
}

function loadCatalog(projectId, request) {
    const uri = `/gdc/internal/projects/${projectId}/loadCatalog`;
    return xhr.ajax(uri, {
        type: 'POST',
        data: { catalogRequest: request }
    }).then(data => data.catalogResponse);
}

export function loadItems(projectId, options = {}) {
    let bucketItems = get(options, 'bucketItems.buckets');

    if (bucketItems) {
        bucketItems = bucketItemsToExecConfig(bucketItems);
        return loadCatalog(
            projectId,
            {
                ...REQUEST_DEFAULTS,
                ...options,
                bucketItems
            }
        );
    }

    return loadCatalog(projectId, { ...REQUEST_DEFAULTS, ...options });
}

function requestDateDataSets(projectId, request) {
    const uri = `/gdc/internal/projects/${projectId}/loadDateDataSets`;

    return xhr.ajax(uri, {
        type: 'POST',
        data: { dateDataSetsRequest: request }
    });
}

export function loadDateDataSets(projectId, options) {
    let bucketItems = get(options, 'bucketItems.buckets');

    if (bucketItems) {
        bucketItems = bucketItemsToExecConfig(bucketItems);
    }

    // /loadDateDataSets has different parameter for dataSet loading then /loadCatalog
    // see https://github.com/gooddata/gdc-bear/blob/develop/resources/specification/internal/date_data_sets.res
    const requestSpecificOptions = {
        csvDataSetIdentifier: get(options, 'dataSetIdentifier')
    };

    const request = omit({
        ...LOAD_DATE_DATASET_DEFAULTS,
        ...REQUEST_DEFAULTS,
        ...options,
        ...requestSpecificOptions,
        bucketItems
    }, ['filter', 'types', 'paging', 'dataSetIdentifier']);

    return requestDateDataSets(projectId, request);
}
