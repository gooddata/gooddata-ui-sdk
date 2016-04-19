import {
    get,
    find,
    includes,
    sortBy,
    first
} from 'lodash';

import { pretty } from 'js-object-pretty-print';
import levenshtein from 'fast-levenshtein';

function fail(message) {
    throw new Error(message);
}

function missingMetricDefinition(metricDefinition, closest) {
    const title = get(metricDefinition, 'title');

    fail(`Metric definition (${title}) was not found: ${pretty(metricDefinition)}, mismatch of ${pretty(closest)}?`);
}

function missingColumn(column, closest) {
    fail(`Column not found '${column}', mismatch of ${closest}?`);
}

function getClosestMatch(candidates, getDistance) {
    const table = candidates.map(candidate => {
        const distance = getDistance(candidate);

        return { distance, candidate };
    });

    const closestMatch = first(sortBy(table, row => row.distance));

    return get(closestMatch, 'candidate');
}

function getClosestColumn(column, candidates) {
    return getClosestMatch(candidates, candidate => {
        return levenshtein.get(column, candidate);
    });
}

function getClosestMetricDefinition(definition, candidates) {
    return getClosestMatch(candidates, candidate => {
        return Object.keys(candidate).reduce((sum, prop) => {
            return sum + levenshtein.get(definition[prop], candidate[prop]);
        }, 0);
    });
}

export function expectColumns(expected, reportDefinition) {
    const actualColumns = get(reportDefinition, 'execution.columns');

    expected.forEach(expectedColumn => {
        if (!includes(actualColumns, expectedColumn)) {
            missingColumn(expectedColumn, getClosestColumn(expectedColumn, actualColumns));
        }
    });

    expect(expected).to.eql(actualColumns);
}

export function expectMetricDefinition(expected, reportDefinition) {
    const actualMetricDefinitions = get(reportDefinition, 'execution.definitions')
        .map(definition => get(definition, 'metricDefinition'));

    const defFound = find(actualMetricDefinitions, expected);

    if (!defFound) {
        missingMetricDefinition(expected,
            getClosestMetricDefinition(expected, actualMetricDefinitions));
    }
}

export function expectWhereCondition(expected, reportDefinition) {
    const actualWhereCondition = get(reportDefinition, 'execution.where');

    expect(expected).to.eql(actualWhereCondition);
}
