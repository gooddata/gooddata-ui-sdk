// (C) 2007-2019 GoodData Corporation

import cloneDeep from "lodash/cloneDeep";
import { AFM, ExecuteAFM } from "@gooddata/typings";

function convertElementsArray(arr: string[], isText?: boolean): ExecuteAFM.AttributeElements {
    return isText ? { values: arr } : { uris: arr };
}

function convertPositiveAttributeFilter(
    filter: AFM.IPositiveAttributeFilter,
): ExecuteAFM.IPositiveAttributeFilter {
    const { positiveAttributeFilter: oldFilter } = filter;

    return {
        positiveAttributeFilter: {
            displayForm: oldFilter.displayForm,
            in: convertElementsArray(oldFilter.in, oldFilter.textFilter),
        },
    };
}

function convertNegativeAttributeFilter(
    filter: AFM.INegativeAttributeFilter,
): ExecuteAFM.INegativeAttributeFilter {
    const { negativeAttributeFilter: oldFilter } = filter;

    return {
        negativeAttributeFilter: {
            displayForm: oldFilter.displayForm,
            notIn: convertElementsArray(oldFilter.notIn, oldFilter.textFilter),
        },
    };
}

export function convertFilter(filter: AFM.CompatibilityFilter): ExecuteAFM.CompatibilityFilter {
    if (AFM.isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter);
    } else if (AFM.isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter);
    }

    return filter;
}

function convertMeasureFilter(filter: AFM.FilterItem): ExecuteAFM.FilterItem {
    if (AFM.isPositiveAttributeFilter(filter)) {
        return convertPositiveAttributeFilter(filter);
    } else if (AFM.isNegativeAttributeFilter(filter)) {
        return convertNegativeAttributeFilter(filter);
    }

    return filter;
}

function convertFilters(filters?: AFM.CompatibilityFilter[]): ExecuteAFM.CompatibilityFilter[] | undefined {
    return filters !== undefined ? filters.map(convertFilter) : filters;
}

function convertMeasureFilters(filters?: AFM.FilterItem[]): ExecuteAFM.FilterItem[] | undefined {
    return filters !== undefined ? filters.map(convertMeasureFilter) : filters;
}

function convertMeasure(measure: AFM.IMeasure): ExecuteAFM.IMeasure {
    if (AFM.isSimpleMeasureDefinition(measure.definition)) {
        const simpleMeasure = measure.definition.measure;
        const filters = convertMeasureFilters(simpleMeasure.filters);
        const filtersProp = filters ? { filters } : {};

        return {
            ...measure,
            definition: {
                measure: {
                    ...simpleMeasure,
                    ...filtersProp,
                },
            },
        };
    }

    return measure;
}

function convertMeasures(measures?: AFM.IMeasure[]): ExecuteAFM.IMeasure[] | undefined {
    return measures !== undefined ? measures.map(convertMeasure) : measures;
}

/**
 * Converts 'client-land' AFM to one that will be sent to backend.
 *
 * @param afm afm to convert
 * @returns new instance of ExecuteAFM.IAfm structure
 */
export function convertAfm(afm?: AFM.IAfm): ExecuteAFM.IAfm {
    if (afm === undefined) {
        return {};
    }

    const executeAFM: ExecuteAFM.IAfm = {
        ...afm,
        measures: convertMeasures(afm.measures),
        filters: convertFilters(afm.filters),
    };

    return cloneDeep(executeAFM);
}

function convertExecution(execution: AFM.IExecution): ExecuteAFM.IExecution {
    return {
        execution: {
            afm: convertAfm(execution.execution.afm),
            resultSpec: execution.execution.resultSpec,
        },
    };
}

/**
 * Converts 'client-land' AFM to JSON payload acceptable by REST API.
 *
 * @param execution execution to send to API
 */
export function convertExecutionToJson(execution: AFM.IExecution): string {
    return JSON.stringify(convertExecution(execution));
}
