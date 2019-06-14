// (C) 2007-2018 GoodData Corporation
import { get, find, includes, sortBy, first } from "lodash";

import { IMetricDefinition } from "../../src/interfaces";

export interface IReportDefinition {
    columns: string[];
    definitions: IMetricDefinition[];
}

import { pretty } from "js-object-pretty-print";
import * as levenshtein from "fast-levenshtein";

function fail(message: string) {
    throw new Error(message);
}

function missingMetricDefinition(
    metricDefinition: IMetricDefinition,
    closestMetricDefinition: IMetricDefinition,
) {
    const title = get(metricDefinition, "title");

    fail(
        `Metric definition (${title}) was not found:
        ${pretty(metricDefinition)}, mismatch of ${pretty(closestMetricDefinition)}?`,
    );
}

function missingColumn(column: string, closest: string) {
    fail(`Column not found '${column}', mismatch of ${closest}?`);
}

function getClosestMatch(candidates: any[], getDistance: (candidate: any) => number) {
    const table = candidates.map(candidate => {
        const distance = getDistance(candidate);

        return { distance, candidate };
    });

    const closestMatch = first(sortBy(table, row => row.distance));

    return get(closestMatch, "candidate");
}

function getClosestColumn(column: string, candidates: any[]) {
    return getClosestMatch(candidates, candidate => {
        return levenshtein.get(column, candidate);
    });
}

function getClosestMetricDefinition(definition: IMetricDefinition, candidates: IMetricDefinition[]) {
    return getClosestMatch(candidates, candidate => {
        return Object.keys(candidate).reduce((sum, prop: string) => {
            const definitionString: string = definition[prop] || "";
            return sum + levenshtein.get(definitionString, candidate[prop]);
        }, 0);
    });
}

export function expectColumns(expected: string[], reportDefinition: IReportDefinition) {
    const actualColumns = get(reportDefinition, "columns");

    expected.forEach((expectedColumn: any) => {
        if (!includes(actualColumns, expectedColumn)) {
            missingColumn(expectedColumn, getClosestColumn(expectedColumn, actualColumns));
        }
    });

    expect(expected).toEqual(actualColumns);
}

export function expectMetricDefinition(expected: IMetricDefinition, reportDefinition: IReportDefinition) {
    const actualMetricDefinitions: IMetricDefinition[] = get(reportDefinition, "definitions").map(
        (definition: any) => get(definition, "metricDefinition"),
    );

    const defFound = find(actualMetricDefinitions, expected);

    if (!defFound) {
        missingMetricDefinition(expected, getClosestMetricDefinition(expected, actualMetricDefinitions));
    }
}

export function expectOrderBy(expected: string, reportDefinition: IReportDefinition) {
    const actualOrderBy = get(reportDefinition, "orderBy");

    expect(expected).toEqual(actualOrderBy);
}

export function expectWhereCondition(expected: string, reportDefinition: IReportDefinition) {
    const actualWhereCondition = get(reportDefinition, "where");

    expect(expected).toEqual(actualWhereCondition);
}
