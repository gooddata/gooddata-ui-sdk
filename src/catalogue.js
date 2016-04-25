import $ from 'jquery';
import { get, fromPairs, trim} from 'lodash';
import * as xhr from './xhr';
import { mdToExecutionConfiguration } from './execution';

const REQUEST_DEFAULTS = {
    types: ['attribute', 'metric', 'fact'],
    paging: {
        offset: 0
    }
};

function bucketItemsToExecConfig(bucketItems) {
    const executionConfig = mdToExecutionConfiguration(bucketItems);
    const definitions = get(executionConfig, 'execution.definitions');
    const idToExpr = fromPairs(definitions.map(({metricDefinition}) => [metricDefinition.identifier, metricDefinition.expression] ));

    return get(executionConfig, 'execution.columns').map((column) => {
        const definition = definitions.find(({ metricDefinition }) => get(metricDefinition, 'identifier') === column);
        const maql = get(definition, 'metricDefinition.expression');

        if (maql) {
            return maql.replace(/{[^}]+}/g, (match) => {
                return idToExpr[trim(match, '{}')].substr('SELECT '.length);
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
    });
}

export function loadItems(projectId, options = {}) {
    let bucketItems = get(options, 'bucketItems.buckets');

    if (bucketItems) {
        bucketItems = bucketItemsToExecConfig(bucketItems);
    }

    return loadCatalog(projectId, { ...REQUEST_DEFAULTS, ...options, bucketItems });
}
