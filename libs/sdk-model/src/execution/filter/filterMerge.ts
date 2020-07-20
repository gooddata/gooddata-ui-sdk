// (C) 2019-2020 GoodData Corporation
import { objRefToString } from "../../objRef";
import {
    IAttributeFilter,
    IDateFilter,
    IFilter,
    IMeasureValueFilter,
    isAbsoluteDateFilter,
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isPositiveAttributeFilter,
} from "./index";
import unionBy from "lodash/unionBy";
import invariant from "ts-invariant";

function filterObjectRef(filter: IFilter): string {
    if (isMeasureValueFilter(filter)) {
        return objRefToString(filter.measureValueFilter.measure);
    }

    if (isDateFilter(filter)) {
        if (isAbsoluteDateFilter(filter)) {
            return objRefToString(filter.absoluteDateFilter.dataSet);
        }
        return objRefToString(filter.relativeDateFilter.dataSet);
    }

    if (isPositiveAttributeFilter(filter)) {
        return objRefToString(filter.positiveAttributeFilter.displayForm);
    }

    return objRefToString(filter.negativeAttributeFilter.displayForm);
}

type FilterByType = {
    attribute: IAttributeFilter[];
    date: IDateFilter[];
    measureValue: IMeasureValueFilter[];
};

function separateFiltersByType(filters: IFilter[]): FilterByType {
    const result: FilterByType = {
        attribute: [],
        date: [],
        measureValue: [],
    };

    filters.forEach((f) => {
        if (isAttributeFilter(f)) {
            result.attribute.push(f);
        } else if (isDateFilter(f)) {
            result.date.push(f);
        } else {
            result.measureValue.push(f);
        }
    });

    return result;
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
 * TODO: this logic is not in the right place; filter merging needs to be done by backend implementation
 *  to be able to correctly identify objects being filtered on - regardless of how they are referenced. this
 *  function will return bogus if one filter references say display form by URI and the other references
 *  the same display form by identifier.
 *
 * @param originalFilters - original filters to merge with
 * @param addedFilters - new filters to add on top of original
 * @internal
 */
export function mergeFilters(originalFilters: IFilter[], addedFilters: IFilter[] | undefined): IFilter[] {
    invariant(originalFilters, "original filters must be specified");

    if (!addedFilters || !addedFilters.length) {
        return originalFilters;
    }

    const original = separateFiltersByType(originalFilters);
    const added = separateFiltersByType(addedFilters);

    // concat attribute filters
    const attributeFilters = [...original.attribute, ...added.attribute];

    // merge date filters by date dataset qualifier
    // added date filters should win, so they are specified first, unionBy prefers items from the first argument
    const dateFilters = unionBy(added.date, original.date, filterObjectRef);

    // concat measure value filters
    const measureValueFilters = [...original.measureValue, ...added.measureValue];

    return [...attributeFilters, ...dateFilters, ...measureValueFilters];
}
