// (C) 2007-2026 GoodData Corporation

import { cloneDeep, update } from "lodash-es";

import { getIdOrigin } from "@gooddata/sdk-backend-tiger";
import {
    type IFilterContextContent,
    type IRemoveFilterContextContent,
    type ObjQualifier,
    isAbsoluteDateFilter,
    isArbitraryAttributeFilterItem,
    isMatchAttributeFilterItem,
    isNegativeAttributeFilter,
    isObjIdentifierQualifier,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
    isRemoveAttributeFilter,
    isRemoveDateFilter,
} from "@gooddata/sdk-embedding";

import { type ICustomRouteParams } from "../typings/location.js";

export function sanitizeIdPrefix(id: string) {
    return getIdOrigin(id).id;
}

export function sanitizeRouteParams(params: ICustomRouteParams): ICustomRouteParams {
    return {
        ...params,
        ...(params.reportId ? { reportId: sanitizeIdPrefix(params.reportId) } : {}),
    };
}

export function sanitizeSetFilterContext(
    filters: IFilterContextContent["filters"],
): IFilterContextContent["filters"] {
    return filters.map((filter) => {
        if (isAbsoluteDateFilter(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["absoluteDateFilter", "dataSet"], sanitizeQualifier);
            return updatedFilter;
        }
        if (isRelativeDateFilter(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["relativeDateFilter", "dataSet"], sanitizeQualifier);
            return updatedFilter;
        }
        if (isPositiveAttributeFilter(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["positiveAttributeFilter", "displayForm"], sanitizeQualifier);
            return updatedFilter;
        }
        if (isNegativeAttributeFilter(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["negativeAttributeFilter", "displayForm"], sanitizeQualifier);
            return updatedFilter;
        }
        if (isArbitraryAttributeFilterItem(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["arbitraryAttributeFilter", "displayForm"], sanitizeQualifier);
            return updatedFilter;
        }
        if (isMatchAttributeFilterItem(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["matchAttributeFilter", "displayForm"], sanitizeQualifier);
            return updatedFilter;
        }
        return filter;
    });
}

export function sanitizeRemoveFilterContext(
    filters: IRemoveFilterContextContent["filters"],
): IRemoveFilterContextContent["filters"] {
    return filters.map((filter) => {
        if (isRemoveDateFilter(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["dataSet"], sanitizeQualifier);
            return updatedFilter;
        }
        if (isRemoveAttributeFilter(filter)) {
            const updatedFilter = cloneDeep(filter);
            update(updatedFilter, ["displayForm"], sanitizeQualifier);
            return updatedFilter;
        }
        return filter;
    });
}

function sanitizeQualifier(qualifier: ObjQualifier) {
    if (isObjIdentifierQualifier(qualifier)) {
        return {
            ...qualifier,
            identifier: sanitizeIdPrefix(qualifier.identifier),
        };
    }
    return qualifier;
}
