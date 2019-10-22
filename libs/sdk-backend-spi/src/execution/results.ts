// (C) 2019 GoodData Corporation

import isEmpty = require("lodash/isEmpty");

/**
 * Single calculated data value. The data value may be 'null' - the semantics here are same as with
 * SQL nulls. The calculated numeric value WILL be returned in string representation - this is to
 * prevent float number precision errors.
 *
 * TODO: we should probably get rid of number variant
 * @public
 */
export type DataValue = null | string | number;

/**
 * Describes measure group and its contents.
 * @public
 */
export interface IMeasureGroupHeader {
    measureGroupHeader: {
        items: IMeasureHeaderItem[];
        totalItems?: ITotalHeaderItem[];
    };
}

/**
 * Describes measure included in a dimension.
 *
 * @public
 */
export interface IMeasureHeaderItem {
    measureHeaderItem: {
        uri?: string;
        identifier?: string;
        localIdentifier: string;
        name: string;
        format: string;
    };
}

/**
 * Describes total included in a dimension.
 *
 * @public
 */
export interface ITotalHeaderItem {
    totalHeaderItem: {
        name: string;
    };
}

/**
 * Describes attribute slicing of a dimension.
 *
 * @public
 */
export interface IAttributeHeader {
    attributeHeader: {
        uri: string;
        identifier: string;
        localIdentifier: string;
        name: string;
        totalItems?: ITotalHeaderItem[];
        formOf: {
            uri: string;
            identifier: string;
            name: string;
        };
    };
}

/**
 * Headers describing contents of a dimension.
 *
 * @public
 */
export type IHeader = IMeasureGroupHeader | IAttributeHeader;

/**
 * Describes what LDM objects were used to obtain data and metadata for the dimension of a cross-tabulated result.
 *
 * This best best demonstrated using examples.
 *
 * 1. Execution was done for attribute A1 and measures M1 and M2. Both attribute and measureGroup are in single
 *    dimension.
 *
 * The result dimension will contain two headers, first will be header describing the attribute {@link IAttributeHeader},
 * followed by {@link IMeasureGroupHeader}. The measure group header contains two items - one for each requested
 * measure.
 *
 * 2. Execution was done for attributes A1 and A2, measures M1 and M2. Attribute A1 is in first dimension and
 *    the remainder of objects (A2 and measureGroup) is in second dimension.
 *
 * There will be two result dimension descriptors. First descriptor will specify single header for A1 attribute,
 * second descriptor will have two headers, first will be header for attribute A2 and then measure group header
 * with two items.
 *
 * @public
 */
export interface IResultDimension {
    headers: IHeader[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IResultAttributeHeaderItem {
    attributeHeaderItem: {
        uri: string;
        name: string;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IResultMeasureHeaderItem {
    measureHeaderItem: {
        name: string;
        order: number;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IResultTotalHeaderItem {
    totalHeaderItem: {
        name: string;
        type: string;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export type IResultHeaderItem =
    | IResultAttributeHeaderItem
    | IResultMeasureHeaderItem
    | IResultTotalHeaderItem;

//
// Type guards
//

/**
 * TODO: SDK8: add docs
 * @public
 */
export function isAttributeHeader(obj: any): obj is IAttributeHeader {
    return !isEmpty(obj) && (obj as IAttributeHeader).attributeHeader !== undefined;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function isMeasureGroupHeader(obj: any): obj is IMeasureGroupHeader {
    return !isEmpty(obj) && (obj as IMeasureGroupHeader).measureGroupHeader !== undefined;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function isMeasureHeaderItem(obj: any): obj is IMeasureHeaderItem {
    return !isEmpty(obj) && (obj as IMeasureHeaderItem).measureHeaderItem !== undefined;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function isTotalHeader(obj: any): obj is ITotalHeaderItem {
    return !isEmpty(obj) && (obj as ITotalHeaderItem).totalHeaderItem !== undefined;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function isResultAttributeHeaderItem(obj: any): obj is IResultAttributeHeaderItem {
    return !isEmpty(obj) && (obj as IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function isResultMeasureHeaderItem(obj: any): obj is IResultMeasureHeaderItem {
    return (
        !isEmpty(obj) &&
        (obj as IResultMeasureHeaderItem).measureHeaderItem !== undefined &&
        (obj as IResultMeasureHeaderItem).measureHeaderItem.order !== undefined
    );
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export function isResultTotalHeaderItem(obj: any): obj is IResultTotalHeaderItem {
    return (
        !isEmpty(obj) &&
        (obj as IResultTotalHeaderItem).totalHeaderItem !== undefined &&
        (obj as IResultTotalHeaderItem).totalHeaderItem.type !== undefined
    );
}
