// (C) 2020 GoodData Corporation
import stringify from "json-stable-stringify";
import {
    attributeElementsIsEmpty,
    IFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
} from "../filter";

/**
 * Calculates filter fingerprint; ensures that filters that have semantically no effect result in no fingerprint.
 *
 * This is the case for:
 *
 * -  Measure Value filter with no condition specified
 * -  Negative attribute filter with empty 'notIn' field
 *
 * Note: the ALL_TIME date filter is not treated this way on purpose.
 *
 * @internal
 */
export function filterFingerprint(filter: IFilter): string | undefined {
    if (isMeasureValueFilter(filter)) {
        if (!filter.measureValueFilter.condition) {
            return;
        }
    } else if (isNegativeAttributeFilter(filter)) {
        if (attributeElementsIsEmpty(filter.negativeAttributeFilter.notIn)) {
            return;
        }
    }

    return stringify(filter);
}
