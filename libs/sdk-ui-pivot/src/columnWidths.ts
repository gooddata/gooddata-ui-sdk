// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { Identifier } from "@gooddata/sdk-model";

//
// types used in implementation internals
//

/**
 * @internal
 */
export enum ColumnEventSourceType {
    AUTOSIZE_COLUMNS = "autosizeColumns",
    UI_DRAGGED = "uiColumnDragged",
    FIT_GROW = "growToFit",
}

/**
 * @internal
 */
export enum UIClick {
    CLICK = 1,
    DOUBLE_CLICK = 2,
}

/**
 * @internal
 */
export interface IResizedColumns {
    [columnIdentifier: string]: IManuallyResizedColumnsItem;
}

/**
 * @internal
 */
export interface IManuallyResizedColumnsItem {
    width: number;
    allowGrowToFit?: boolean;
}

//
//
//

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
        locators: ColumnLocator[];
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
        locator: IMeasureColumnLocator;
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
export type ColumnLocator = IAttributeColumnLocator | IMeasureColumnLocator;

/**
 * Locates table column by column measure's localId.
 *
 * @public
 */
export interface IMeasureColumnLocator {
    measureLocatorItem: {
        /**
         * Local identifier of the measure.
         */
        measureIdentifier: Identifier;
    };
}

/**
 * Locates all columns for an attribute or columns for particular attribute element.
 *
 * @public
 */
export interface IAttributeColumnLocator {
    attributeLocatorItem: {
        /**
         * Local identifier of the attribute
         */
        attributeIdentifier: Identifier;

        /**
         * Optionally attribute element URI / primary key.
         */
        element?: string;
    };
}

/**
 * Tests whether object is an instance of {@link IMeasureColumnLocator}
 *
 * @public
 */
export function isMeasureColumnLocator(obj: unknown): obj is IMeasureColumnLocator {
    return !isEmpty(obj) && (obj as IMeasureColumnLocator).measureLocatorItem !== undefined;
}

/**
 * Tests whether object is an instance of {@link IAttributeColumnLocator}
 *
 * @public
 */
export function isAttributeColumnLocator(obj: unknown): obj is IAttributeColumnLocator {
    return !isEmpty(obj) && (obj as IAttributeColumnLocator).attributeLocatorItem !== undefined;
}

/**
 * Tests whether object is an instance of {@link IAbsoluteColumnWidth}
 *
 * @public
 */
export function isAbsoluteColumnWidth(columnWidth: ColumnWidth): columnWidth is IAbsoluteColumnWidth {
    return Number(columnWidth.value) === columnWidth.value;
}

/**
 * Tests whether object is an instance of {@link IAttributeColumnWidthItem}
 *
 * @public
 */
export function isAttributeColumnWidthItem(obj: unknown): obj is IAttributeColumnWidthItem {
    return !isEmpty(obj) && (obj as IAttributeColumnWidthItem).attributeColumnWidthItem !== undefined;
}

/**
 * Tests whether object is an instance of {@link IMeasureColumnWidthItem}
 *
 * @public
 */
export function isMeasureColumnWidthItem(obj: unknown): obj is IMeasureColumnWidthItem {
    return (
        !isEmpty(obj) &&
        (obj as IMeasureColumnWidthItem).measureColumnWidthItem !== undefined &&
        (obj as IMeasureColumnWidthItem).measureColumnWidthItem.locators !== undefined
    );
}

/**
 * Tests whether object is an instance of {@link IAllMeasureColumnWidthItem}
 *
 * @public
 */
export function isAllMeasureColumnWidthItem(obj: unknown): obj is IAllMeasureColumnWidthItem {
    return (
        !isEmpty(obj) &&
        (obj as IAllMeasureColumnWidthItem).measureColumnWidthItem !== undefined &&
        (obj as IMeasureColumnWidthItem).measureColumnWidthItem.locators === undefined &&
        (obj as IWeakMeasureColumnWidthItem).measureColumnWidthItem.locator === undefined
    );
}

/**
 * Tests whether object is an instance of {@link IWeakMeasureColumnWidthItem}
 *
 * @public
 */
export function isWeakMeasureColumnWidthItem(obj: unknown): obj is IWeakMeasureColumnWidthItem {
    return (
        !isEmpty(obj) &&
        (obj as IWeakMeasureColumnWidthItem).measureColumnWidthItem !== undefined &&
        (obj as IWeakMeasureColumnWidthItem).measureColumnWidthItem.locator !== undefined
    );
}

// TODO: add factory functions
