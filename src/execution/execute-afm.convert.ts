// (C) 2007-2019 GoodData Corporation

import cloneDeep = require('lodash/cloneDeep');
import { AFM, ExecuteAFM } from '@gooddata/typings';

function convertElementsArray(arr: string[], isText?: boolean): ExecuteAFM.AttributeElements {
    return isText ? { values: arr } : { uris: arr };
}

function convertFilter(filter: AFM.CompatibilityFilter): ExecuteAFM.CompatibilityFilter {
    if (AFM.isPositiveAttributeFilter(filter)) {
        const { positiveAttributeFilter: oldFilter } = filter;

        return {
            positiveAttributeFilter: {
                displayForm: oldFilter.displayForm,
                in: convertElementsArray(oldFilter.in, oldFilter.textFilter)
            }
        };
    } else if (AFM.isNegativeAttributeFilter(filter)) {
        const { negativeAttributeFilter: oldFilter } = filter;

        return {
            negativeAttributeFilter: {
                displayForm: oldFilter.displayForm,
                notIn: convertElementsArray(oldFilter.notIn, oldFilter.textFilter)
            }
        };
    }

    return filter;
}

function convertFilters(filters?: AFM.CompatibilityFilter[]): ExecuteAFM.CompatibilityFilter[] | undefined {
    return filters !== undefined ? filters.map(convertFilter) : filters;
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
        filters: convertFilters(afm.filters)
    };

    return cloneDeep(executeAFM);
}

function convertExecution(execution: AFM.IExecution): ExecuteAFM.IExecution {
    return {
        execution: {
            afm: convertAfm(execution.execution.afm),
            resultSpec: execution.execution.resultSpec
        }
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
