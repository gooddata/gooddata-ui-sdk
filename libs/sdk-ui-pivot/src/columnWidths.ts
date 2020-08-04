// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { Identifier, IMeasureLocatorItem } from "@gooddata/sdk-model";

export enum ColumnEventSourceType {
    AUTOSIZE_COLUMNS = "autosizeColumns",
    UI_DRAGGED = "uiColumnDragged",
    FIT_GROW = "growToFit",
}

export enum UIClick {
    CLICK = 1,
    DOUBLE_CLICK = 2,
}

export interface IResizedColumns {
    [columnIdentifier: string]: IManuallyResizedColumnsItem;
}

export interface IManuallyResizedColumnsItem {
    width: number;
    allowGrowToFit?: boolean;
}

/**
 * @public
 */
export function isAbsoluteColumnWidth(columnWidth: ColumnWidth): columnWidth is IAbsoluteColumnWidth {
    return Number(columnWidth.value) === columnWidth.value;
}

/**
 * @public
 */
export interface IAbsoluteColumnWidth {
    value: number;
    allowGrowToFit?: boolean;
}

/**
 * @public
 */
export interface IAutoColumnWidth {
    value: "auto";
}

/**
 * @public
 */
export type ColumnWidth = IAbsoluteColumnWidth | IAutoColumnWidth;

/**
 * @public
 */
export interface IAttributeColumnWidthItem {
    attributeColumnWidthItem: {
        width: IAbsoluteColumnWidth;
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
        width: IAbsoluteColumnWidth;
    };
}

/**
 * @public
 */
export interface IWeakMeasureColumnWidthItem {
    measureColumnWidthItem: {
        width: IAbsoluteColumnWidth;
        locator: IMeasureLocatorItem;
    };
}

/**
 * @public
 */
export type ColumnWidthItem =
    | IAttributeColumnWidthItem
    | IMeasureColumnWidthItem
    | IAllMeasureColumnWidthItem
    | IWeakMeasureColumnWidthItem;

/**
 * @public
 */
export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

/**
 * @public
 */
export interface IAttributeLocatorItem {
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
        (columnWidthItem as IMeasureColumnWidthItem).measureColumnWidthItem.locators === undefined &&
        (columnWidthItem as IWeakMeasureColumnWidthItem).measureColumnWidthItem.locator === undefined
    );
}

/**
 * @public
 */
export function isWeakMeasureColumnWidthItem(
    columnWidthItem: ColumnWidthItem,
): columnWidthItem is IWeakMeasureColumnWidthItem {
    return (
        !isEmpty(columnWidthItem) &&
        (columnWidthItem as IWeakMeasureColumnWidthItem).measureColumnWidthItem !== undefined &&
        (columnWidthItem as IWeakMeasureColumnWidthItem).measureColumnWidthItem.locator !== undefined
    );
}

// TODO: add factory functions
