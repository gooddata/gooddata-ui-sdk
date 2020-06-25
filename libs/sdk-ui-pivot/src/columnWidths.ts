// (C) 2007-2020 GoodData Corporation
import isEmpty = require("lodash/isEmpty");
import { Identifier, IMeasureLocatorItem } from "@gooddata/sdk-model";

/**
 * @public
 */
export type ColumnWidthItem =
    | IAttributeColumnWidthItem
    | IAllMeasureColumnWidthItem
    | IMeasureColumnWidthItem;

/**
 * @public
 */
export type AbsoluteColumnWidth = number;

/**
 * @public
 */
export type ColumnWidth = AbsoluteColumnWidth | "auto";

export function isAbsoluteColumnWidth(columnWidth: ColumnWidth): columnWidth is AbsoluteColumnWidth {
    return Number(columnWidth) === columnWidth;
}

export function isColumnWidthAuto(columnWidth: ColumnWidth): boolean {
    return columnWidth === "auto";
}

/**
 * @public
 */
export interface IAttributeColumnWidthItem {
    attributeColumnWidthItem: {
        width: AbsoluteColumnWidth;
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

/**
 * @public
 */
export interface IAllMeasureColumnWidthItem {
    measureColumnWidthItem: {
        width: AbsoluteColumnWidth;
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
        (columnWidthItem as IMeasureColumnWidthItem).measureColumnWidthItem !== undefined &&
        (columnWidthItem as IMeasureColumnWidthItem).measureColumnWidthItem.locators !== undefined
    );
}

/**
 * @public
 */
export function isAllMeasureColumnWidthItem(
    columnWidthItem: ColumnWidthItem,
): columnWidthItem is IAllMeasureColumnWidthItem {
    return (
        !isEmpty(columnWidthItem) &&
        (columnWidthItem as IAllMeasureColumnWidthItem).measureColumnWidthItem !== undefined &&
        (columnWidthItem as IMeasureColumnWidthItem).measureColumnWidthItem.locators === undefined
    );
}

// TODO: add factory functions
