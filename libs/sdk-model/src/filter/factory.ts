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
 * @param displayFormId - identifier of the attribute display form to filter on
 * @param inValues - values to filter for
 * @public
 */
export function newPositiveAttributeFilter(
    displayFormId: string,
    inValues: AttributeElements,
): IPositiveAttributeFilter {
    return {
        positiveAttributeFilter: {
            displayForm: { identifier: displayFormId },
            in: inValues,
        },
    };
}

/**
 * Creates a new negative attribute filter.
 * @param displayFormId - identifier of the attribute display form to filter on
 * @param notInValues - values to filter out
 * @public
 */
export function newNegativeAttributeFilter(
    displayFormId: string,
    notInValues: string[] | AttributeElements,
): INegativeAttributeFilter {
    return {
        negativeAttributeFilter: {
            displayForm: { identifier: displayFormId },
            notIn: notInValues as AttributeElements,
        },
    };
}

/**
 * Creates a new absolute date filter.
 * @param dateDataSetId - identifier of the date data set to filter on
 * @param from - start of the interval in ISO-8601 calendar date format
 * @param to - end of the interval in ISO-8601 calendar date format
 * @public
 */
export function newAbsoluteDateFilter(dateDataSetId: string, from: string, to: string): IAbsoluteDateFilter {
    return {
        absoluteDateFilter: {
            dataSet: { identifier: dateDataSetId },
            from,
            to,
        },
    };
}

/**
 * Creates a new relative date filter.
 * @param dateDataSetId - identifier of the date data set to filter on
 * @param granularity - granularity of the filters (month, year, etc.)
 * @param from - start of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @param to - end of the interval – negative numbers mean the past, zero means today, positive numbers mean the future
 * @public
 */
export function newRelativeDateFilter(
    dateDataSetId: string,
    granularity: string,
    from: number,
    to: number,
): IRelativeDateFilter {
    return {
        relativeDateFilter: {
            dataSet: { identifier: dateDataSetId },
            granularity,
            from,
            to,
        },
    };
}
