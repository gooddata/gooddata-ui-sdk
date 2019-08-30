// (C) 2019 GoodData Corporation
import { ObjQualifier } from "../base";

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
export type IFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;
