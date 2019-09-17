// (C) 2019 GoodData Corporation
import { ObjQualifier } from "../base";
import isEmpty = require("lodash/isEmpty");

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttributeElementsByRef {
    uris: string[];
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttributeElementsByValue {
    values: string[];
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type AttributeElements = IAttributeElementsByRef | IAttributeElementsByValue;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IPositiveAttributeFilter {
    positiveAttributeFilter: {
        displayForm: ObjQualifier;
        in: AttributeElements;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface INegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjQualifier;
        notIn: AttributeElements;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjQualifier;
        from: string;
        to: string;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjQualifier;
        granularity: string;
        from: number;
        to: number;
    };
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type IAttributeFilter = IPositiveAttributeFilter | INegativeAttributeFilter;

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export type IDateFilter = IRelativeDateFilter | IAbsoluteDateFilter;

/**
 * TODO: SDK8: Add docs
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isPositiveAttributeFilter(obj: any): obj is IPositiveAttributeFilter {
    return !isEmpty(obj) && (obj as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isNegativeAttributeFilter(obj: any): obj is INegativeAttributeFilter {
    return !isEmpty(obj) && (obj as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isAbsoluteDateFilter(obj: any): obj is IAbsoluteDateFilter {
    return !isEmpty(obj) && (obj as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isRelativeDateFilter(obj: any): obj is IRelativeDateFilter {
    return !isEmpty(obj) && (obj as IRelativeDateFilter).relativeDateFilter !== undefined;
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isAttributeFilter(obj: any): obj is IAttributeFilter {
    return isPositiveAttributeFilter(obj) || isNegativeAttributeFilter(obj);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isDateFilter(obj: any): obj is IDateFilter {
    return isRelativeDateFilter(obj) || isAbsoluteDateFilter(obj);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function isAttributeElementsByRef(obj: any): obj is IAttributeElementsByRef {
    return !isEmpty(obj) && (obj as IAttributeElementsByRef).uris !== undefined;
}

/**
 * TODO: SDK8: Add docs
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
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function filterIsEmpty(filter: IAttributeFilter): boolean {
    if (isPositiveAttributeFilter(filter)) {
        return attributeElementsIsEmpty(filter.positiveAttributeFilter.in);
    }

    return attributeElementsIsEmpty(filter.negativeAttributeFilter.notIn);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function filterFingerprint(filter: IFilter): string {
    return JSON.stringify(filter);
}

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export function attributeElementsIsEmpty(attributeElements: AttributeElements): boolean {
    if (isAttributeElementsByRef(attributeElements)) {
        return isEmpty(attributeElements.uris.length);
    }

    return isEmpty(attributeElements.values.length);
}
