// (C) 2019 GoodData Corporation

import isEmpty from "lodash/isEmpty";

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

export function isResultAttributeHeaderItem(obj: any): obj is IResultAttributeHeaderItem {
    return !isEmpty(obj) && (obj as IResultAttributeHeaderItem).attributeHeaderItem !== undefined;
}
