// (C) 2019 GoodData Corporation
import {
    AttributeElements,
    IAbsoluteDateFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
} from ".";
import { attributeIdentifier, IAttribute } from "../attribute";

/**
 * Creates a new positive attribute filter.
 *
 * @param attributeOrId - either instance of attribute to create filter for or identifier of attribute's display form
 *  if the input is attribute object, then it is expected that attribute references display form by identifier
 * @param inValues - values to filter for; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_
 * @public
 */
export function newPositiveAttributeFilter(
    attributeOrId: IAttribute | string,
    inValues: AttributeElements | string[],
): IPositiveAttributeFilter {
    const displayFormId =
        typeof attributeOrId === "string" ? attributeOrId : attributeIdentifier(attributeOrId)!;
    const inObject: AttributeElements = Array.isArray(inValues) ? { values: inValues } : inValues;

    return {
        positiveAttributeFilter: {
            displayForm: { identifier: displayFormId },
            in: inObject,
        },
    };
}

/**
 * Creates a new negative attribute filter.
 *
 * @param attributeOrId - either instance of attribute to create filter for or identifier of attribute's display form;
 *  if the input is attribute object, then it is expected that attribute references display form by identifier
 * @param notInValues - values to filter out; these can be either specified as AttributeElements object or as an array
 *  of attribute element _values_
 * @public
 */
export function newNegativeAttributeFilter(
    attributeOrId: IAttribute | string,
    notInValues: AttributeElements | string[],
): INegativeAttributeFilter {
    const displayFormId =
        typeof attributeOrId === "string" ? attributeOrId : attributeIdentifier(attributeOrId)!;
    const notInObject: AttributeElements = Array.isArray(notInValues) ? { values: notInValues } : notInValues;

    return {
        negativeAttributeFilter: {
            displayForm: { identifier: displayFormId },
            notIn: notInObject,
        },
    };
}

/**
 * Creates a new absolute date filter.
 *
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
 * Defines date data set granularities that can be used in relative date filter.
 *
 * @public
 */
export const DateGranularity = {
    date: "GDC.time.date",
    week: "GDC.time.week_us",
    month: "GDC.time.month",
    quarter: "GDC.time.quarter",
    year: "GDC.time.year",
};

/**
 * Creates a new relative date filter.
 *
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
