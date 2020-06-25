// (C) 2007-2020 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { Identifier, IMeasureLocatorItem } from "@gooddata/sdk-model";

/**
 * @public
 */
export type ColumnWidthItem = IAttributeColumnWidthItem | IMeasureColumnWidthItem;

/**
 * @public
 */
export type ColumnWidth = number;

/**
 * @public
 */
export interface IAttributeColumnWidthItem {
    attributeColumnWidthItem: {
        width: ColumnWidth;
        attributeIdentifier: Identifier;
    };
}

/**
 * @public
 */
export interface IMeasureColumnWidthItem {
    measureColumnWidthItem: {
        width: ColumnWidth;
        locators: LocatorItem[];
    };
}

// TODO: rename / alias types & add type guards
type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;
interface IAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: Identifier;
        element?: string; // this is difference from AFM.IAttributeLocatorItem
    };
}

/**
 * @public
 */
export function isAttributeColumnWidthItem(
    columnWidthItem: ColumnWidthItem,
): columnWidthItem is IAttributeColumnWidthItem {
    return (
        !isEmpty(columnWidthItem) &&
        (columnWidthItem as IAttributeColumnWidthItem).attributeColumnWidthItem !== undefined
    );
}

/**
 * @public
 */
export function isMeasureColumnWidthItem(
    columnWidthItem: ColumnWidthItem,
): columnWidthItem is IMeasureColumnWidthItem {
    return (
        !isEmpty(columnWidthItem) &&
        (columnWidthItem as IMeasureColumnWidthItem).measureColumnWidthItem !== undefined
    );
}

// TODO: add factory functions
