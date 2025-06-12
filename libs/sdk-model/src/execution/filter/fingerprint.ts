// (C) 2020 GoodData Corporation
import stringify from "json-stable-stringify";
import {
    attributeElementsIsEmpty,
    IFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
} from "./index.js";

/**
 * Determines if a filter has a semantic effect and thus must be taken into account when computing fingerprints.
 *
 * Irrelevant filters are:
 *
 * -  Measure Value filter with no condition specified
 * -  Negative attribute filter with empty 'notIn' field
 *
 * Note: the ALL_TIME date filter is not treated this way on purpose.
 *
 * @internal
 */
export function isFilterRelevantForFingerprinting(filter: IFilter): boolean {
    if (isMeasureValueFilter(filter)) {
        return !!filter.measureValueFilter.condition;
    } else if (isNegativeAttributeFilter(filter)) {
        return !attributeElementsIsEmpty(filter.negativeAttributeFilter.notIn);
    }

    return true;
}

/**
 * Calculates filter fingerprint; ensures that filters that have semantically no effect result in no fingerprint.
 *
 * @remarks see {@link isFilterRelevantForFingerprinting} for information on which filters are considered irrelevant.
 *
 * @internal
 */
export function filterFingerprint(filter: IFilter): string | undefined {
    return isFilterRelevantForFingerprinting(filter) ? stringify(filter) : undefined;
}
