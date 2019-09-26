// (C) 2019 GoodData Corporation

import isEmpty = require("lodash/isEmpty");

/**
 * TODO: SDK8: add docs
 * @public
 */
export type DataValue = null | string | number;

/**
 * TODO: SDK8: add docs
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
 * TODO: SDK8: add docs
 * @public
 */
export interface ITotalHeaderItem {
    totalHeaderItem: {
        name: string;
    };
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IMeasureGroupHeader {
    measureGroupHeader: {
        items: IMeasureHeaderItem[];
        totalItems?: ITotalHeaderItem[];
    };
}

/**
 * TODO: SDK8: add docs
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
 * TODO: SDK8: add docs
 * @public
 */
export type IHeader = IMeasureGroupHeader | IAttributeHeader;

/**
 * TODO: SDK8: add docs
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
