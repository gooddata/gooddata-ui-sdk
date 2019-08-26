// (C) 2007-2018 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import { AFM } from "@gooddata/typings";
import isDateFilter = AFM.isDateFilter;
import isNegativeAttributeFilter = AFM.isNegativeAttributeFilter;
import isPositiveAttributeFilter = AFM.isPositiveAttributeFilter;

/**
 * Tests whether attribute elements are empty of not.
 *
 * @param elements one of the acceptable attribute element forms
 */
export function isEmptyAttributeElements(elements: string[]): boolean {
    return isEmpty(elements);
}

/**
 * Tests whether filter if semantically empty - e.g. it will not have any effect on the results and can thus
 * be discarded.
 *
 * @param filter any acceptable AFM filter
 */
export function isEmptyFilter(filter: AFM.CompatibilityFilter): boolean {
    if (isPositiveAttributeFilter(filter)) {
        return isEmptyAttributeElements(filter.positiveAttributeFilter.in);
    } else if (isNegativeAttributeFilter(filter)) {
        return isEmptyAttributeElements(filter.negativeAttributeFilter.notIn);
    }

    // expression filters were always considered empty
    return !isDateFilter(filter);
}

/**
 * Tests whether filter is semantically not empty - e.g. it will have some effect on the results.
 *
 * @param filter any acceptable AFM filter
 * @deprecated use isEmptyFilter instead
 */
export function isNotEmptyFilter(filter: AFM.CompatibilityFilter): boolean {
    return !isEmptyFilter(filter);
}

/**
 * Merges new filters into existing AFM. This essentially concatenates/appends new filters at the end of the
 * existing filter list defined in the AFM and then filters out any semantically empty, no-effect filters.
 *
 * This function is immutable, it constructs new instance of AFM.
 *
 * @param afm afm to merge filters into
 * @param filters filters to merge
 * @returns new instance of AFM.
 */
export function mergeFilters(afm: AFM.IAfm, filters: AFM.FilterItem[]): AFM.IAfm {
    const cloned = cloneDeep(afm);

    return {
        ...cloned,
        filters: [...(cloned.filters || []), ...filters].filter(isNotEmptyFilter),
    };
}
