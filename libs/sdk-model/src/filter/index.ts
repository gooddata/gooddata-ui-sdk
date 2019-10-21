// (C) 2019 GoodData Corporation
import { ObjRef } from "../base";
import isEmpty = require("lodash/isEmpty");

/**
 * Attribute elements specified by their URI.
 *
 * NOTE: using attribute element URIs is discouraged - the URIs contain identifier of a workspace and thus
 * bind the attribute element to that workspace. The analytical application built using URIs will not work
 * across workspaces.
 *
 * @public
 */
export interface IAttributeElementsByRef {
    uris: string[];
}

/**
 * Attribute elements specified by their textual value.
 *
 * @public
 */
export interface IAttributeElementsByValue {
    values: string[];
}

/**
 * Attribute elements are used in positive and negative attribute filters. They can be specified either
 * using URI (discouraged) or using textual values of the attribute elements.
 *
 * @public
 */
export type AttributeElements = IAttributeElementsByRef | IAttributeElementsByValue;

/**
 * Positive attribute filter essentially adds an `IN <set>` condition to the execution on the backend. When
 * the condition is applied on attribute display form which is included in execution, it essentially limits the
 * attribute elements that will be returned in the results: only those elements that are in the provided list
 * will be returned.
 *
 * The filter can be specified even for attributes that are not included in the execution - such a filter then
 * MAY influence the results of the execution indirectly: if the execution definition specifies MAQL measures that
 * use the filtered attribute.
 *
 * @public
 */
export interface IPositiveAttributeFilter {
    positiveAttributeFilter: {
        /**
         * Display form whose attribute elements are included in the 'in' list.
         */
        displayForm: ObjRef;
        in: AttributeElements;
    };
}

/**
 * Negative attribute filter essentially adds an `NOT IN <set>` condition to the execution on the backend. When
 * the condition is applied on attribute display form which is included in execution, it essentially limits the
 * attribute elements that will be returned in the results: only those elements that ARE NOT in the provided list
 * will be returned.
 *
 * The filter can be specified even for attributes that are not included in the execution - such a filter then
 * MAY influence the results of the execution indirectly: if the execution definition specifies MAQL measures that
 * use the filtered attribute.
 *
 * @public
 */
export interface INegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjRef;
        notIn: AttributeElements;
    };
}

/**
 * Filters results to an absolute date range - from one fixed date to another.
 *
 * @public
 */
export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        /**
         * Date data set for filtering
         */
        dataSet: ObjRef;

        /**
         * Start date (including): this is in format DDMMYYYY
         * TODO: double-check date format
         */
        from: string;

        /**
         * End date (including): this is in format DDMMYYYY
         * TODO: double-check date format
         */
        to: string;
    };
}

/**
 * Filters results to a relative date range. The relative filtering is always done on some granularity - this specifies
 * the units in the 'from' and 'to' fields.
 *
 * {@link DateGranularity}
 * @public
 */
export interface IRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjRef;
        granularity: string;
        from: number;
        to: number;
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
 * Attribute filters limit results of execution to data pertaining to attributes that are or are not specified
 * by the filters.
 *
 * @public
 */
export type IAttributeFilter = IPositiveAttributeFilter | INegativeAttributeFilter;

/**
 * Date filters limit the range of results to data within relative or absolute date range.
 *
 * @public
 */
export type IDateFilter = IRelativeDateFilter | IAbsoluteDateFilter;

/**
 * All possible filters.
 *
 * @public
 */
export type IFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;

//
// Type guards
//

/**
 * Type guard checking whether the provided object is a positive attribute filter.
 *
 * @public
 */
export function isPositiveAttributeFilter(obj: any): obj is IPositiveAttributeFilter {
    return !isEmpty(obj) && (obj as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a negative attribute filter.
 *
 * @public
 */
export function isNegativeAttributeFilter(obj: any): obj is INegativeAttributeFilter {
    return !isEmpty(obj) && (obj as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is an absolute date filter.
 *
 * @public
 */
export function isAbsoluteDateFilter(obj: any): obj is IAbsoluteDateFilter {
    return !isEmpty(obj) && (obj as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is a relative date filter.
 *
 * @public
 */
export function isRelativeDateFilter(obj: any): obj is IRelativeDateFilter {
    return !isEmpty(obj) && (obj as IRelativeDateFilter).relativeDateFilter !== undefined;
}

/**
 * Type guard checking whether the provided object is an attribute filter.
 *
 * @public
 */
export function isAttributeFilter(obj: any): obj is IAttributeFilter {
    return isPositiveAttributeFilter(obj) || isNegativeAttributeFilter(obj);
}

/**
 * Type guard checking whether the provided object is a date filter.
 *
 * @public
 */
export function isDateFilter(obj: any): obj is IDateFilter {
    return isRelativeDateFilter(obj) || isAbsoluteDateFilter(obj);
}

/**
 * Type guard checking whether the provided object is list of attribute elements specified by URI reference.
 *
 * @public
 */
export function isAttributeElementsByRef(obj: any): obj is IAttributeElementsByRef {
    return !isEmpty(obj) && (obj as IAttributeElementsByRef).uris !== undefined;
}

/**
 * Type guard checking whether the provided object is list of attribute elements specified by their text value.
 *
 * @public
 */
export function isAttributeElementsByValue(obj: any): obj is IAttributeElementsByValue {
    return !isEmpty(obj) && (obj as IAttributeElementsByValue).values !== undefined;
}

//
// Functions
//

/**
 * Tests whether the provided attribute element does not specify any attribute elements.
 *
 * @param filter - attribute filter to test
 * @returns true if empty = no attribute elements
 * @public
 */
export function filterIsEmpty(filter: IAttributeFilter): boolean {
    if (isPositiveAttributeFilter(filter)) {
        return attributeElementsIsEmpty(filter.positiveAttributeFilter.in);
    }

    return attributeElementsIsEmpty(filter.negativeAttributeFilter.notIn);
}

/**
 * Tests whether the attribute elements object is empty.
 *
 * @param attributeElements - object to test
 * @returns true if empty = attribute elements not specified in any way (URI or value)
 * @public
 */
export function attributeElementsIsEmpty(attributeElements: AttributeElements): boolean {
    if (isAttributeElementsByRef(attributeElements)) {
        return isEmpty(attributeElements.uris.length);
    }

    return isEmpty(attributeElements.values.length);
}
