// (C) 2019 GoodData Corporation
import { objectRefValue } from "../base";
import {
    IAttributeFilter,
    IDateFilter,
    IFilter,
    isAbsoluteDateFilter,
    isAttributeFilter,
    isDateFilter,
    isPositiveAttributeFilter,
} from "./index";
import partition = require("lodash/partition");
import unionBy = require("lodash/unionBy");

function filterObjectRef(filter: IFilter): string {
    if (isDateFilter(filter)) {
        if (isAbsoluteDateFilter(filter)) {
            return objectRefValue(filter.absoluteDateFilter.dataSet);
        }
        return objectRefValue(filter.relativeDateFilter.dataSet);
    }

    if (isPositiveAttributeFilter(filter)) {
        return objectRefValue(filter.positiveAttributeFilter.displayForm);
    }
    return objectRefValue(filter.negativeAttributeFilter.displayForm);
}

function separateFiltersByType(filters: IFilter[]): [IAttributeFilter[], IDateFilter[]] {
    return partition(filters, isAttributeFilter);
}

/**
 * Merges two sets of filters.
 *
 * - Attribute from both sets are simply concatenated => bunch of ANDed filters
 * - Date filters are merged based on date data set they filter on
 * - For Date filters for the same date data set:
 *   -  filters from the addedFilters list override filters in the original list
 *
 * TODO: we seem to be missing the original logic that was cleaning up filters if the new filter was ALL_TIME?
 *
 * @param originalFilters - original filters to merge with
 * @param addedFilters - new filters to add on top of original
 * @internal
 */
export function mergeFilters(originalFilters: IFilter[], addedFilters: IFilter[] | undefined): IFilter[] {
    if (!addedFilters || !addedFilters.length) {
        return originalFilters;
    }

    const [originalAttributeFilters, originalDateFilters] = separateFiltersByType(originalFilters);
    const [addedAttributeFilters, addedDateFilters] = separateFiltersByType(addedFilters);

    // concat attribute filters
    const attributeFilters = [...originalAttributeFilters, ...addedAttributeFilters];

    // merge date filters by date dataset qualifier
    // added date filters should win, so they are specified first, unionBy prefers items from the first argument
    const dateFilters = unionBy(addedDateFilters, originalDateFilters, filterObjectRef);

    return [...attributeFilters, ...dateFilters];
}
