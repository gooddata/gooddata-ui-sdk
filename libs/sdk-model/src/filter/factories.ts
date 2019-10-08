// (C) 2019 GoodData Corporation
import {
    AttributeElements,
    IAbsoluteDateFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
} from ".";

/**
 * Creates a new positive attribute filter.
 * @param identifier - identifier of the attribute display form to filter on
 * @param inValues - values to filter for
 */
export function newPositiveAttributeFilter(
    identifier: string,
    inValues: AttributeElements,
): IPositiveAttributeFilter {
    return {
        positiveAttributeFilter: {
            displayForm: { identifier },
            in: inValues,
        },
    };
}

/**
 * Creates a new negative attribute filter.
 * @param identifier - identifier of the attribute display form to filter on
 * @param notInValues - values to filter out
 */
export function newNegativeAttributeFilter(
    identifier: string,
    notInValues: string[] | AttributeElements,
): INegativeAttributeFilter {
    return {
        negativeAttributeFilter: {
            displayForm: { identifier },
            notIn: notInValues as AttributeElements,
        },
    };
}

/**
 * Creates a new absolute date filter.
 * @param identifier - identifier of the date data set to filter on
 * @param from - start of the interval in ISO-8601 calendar date format
 * @param to - end of the interval in ISO-8601 calendar date format
 */
export function newAbsoluteDateFilter(identifier: string, from: string, to: string): IAbsoluteDateFilter {
    return {
        absoluteDateFilter: {
            dataSet: { identifier },
            from,
            to,
        },
    };
}

/**
 * Creates a new relative date filter.
 * @param identifier - identifier of the date data set to filter on
 * @param granularity - granularity of the filters (month, year, etc.)
 * @param from - start of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @param to - end of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 */
export function newRelativeDateFilter(
    identifier: string,
    granularity: string,
    from: number,
    to: number,
): IRelativeDateFilter {
    return {
        relativeDateFilter: {
            dataSet: { identifier },
            granularity,
            from,
            to,
        },
    };
}
