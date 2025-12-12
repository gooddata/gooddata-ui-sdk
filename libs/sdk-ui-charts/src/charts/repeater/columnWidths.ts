// (C) 2007-2025 GoodData Corporation
import { type Identifier } from "@gooddata/sdk-model";

//
// types used in implementation internals
//

/**
 * @internal
 */
export enum ColumnEventSourceType {
    AUTOSIZE_COLUMNS = "autosizeColumns",
    FIT_GROW = "growToFit",
    UI_RESIZED = "uiColumnResized",
}

/**
 * @internal
 */
export enum UIClick {
    CLICK = 1,
    DOUBLE_CLICK = 2,
}

//
//
//

/**
 * @public
 */
export interface IRepeaterAbsoluteColumnWidth {
    value: number;
    allowGrowToFit?: boolean;
}

/**
 * @public
 */
export interface IRepeaterAutoColumnWidth {
    value: "auto";
}

/**
 * @public
 */
export type RepeaterColumnWidth = IRepeaterAbsoluteColumnWidth | IRepeaterAutoColumnWidth;

/**
 * Object defining the {@link IRepeaterAttributeColumnWidthItem} object body.
 *
 * @public
 */
export interface IRepeaterAttributeColumnWidthItemBody {
    width: IRepeaterAbsoluteColumnWidth;
    attributeIdentifier: Identifier;
}

/**
 * @public
 */
export interface IRepeaterAttributeColumnWidthItem {
    attributeColumnWidthItem: IRepeaterAttributeColumnWidthItemBody;
}

/**
 * Object defining the {@link IRepeaterMeasureColumnWidthItem} object body.
 *
 * @public
 */
export interface IRepeaterMeasureColumnWidthItemBody {
    width: RepeaterColumnWidth;
    locators: RepeaterColumnLocator[];
}

/**
 * @public
 */
export interface IRepeaterMeasureColumnWidthItem {
    measureColumnWidthItem: IRepeaterMeasureColumnWidthItemBody;
}

/**
 * Object defining the {@link IRepeaterWeakMeasureColumnWidthItem} object body.
 *
 * @public
 */
export interface IRepeaterWeakMeasureColumnWidthItemBody {
    width: IRepeaterAbsoluteColumnWidth;
    locator: IRepeaterMeasureColumnLocator;
}

/**
 * @public
 */
export interface IRepeaterWeakMeasureColumnWidthItem {
    measureColumnWidthItem: IRepeaterWeakMeasureColumnWidthItemBody;
}

/**
 * @public
 */
export type RepeaterColumnWidthItem = IRepeaterAttributeColumnWidthItem | IRepeaterMeasureColumnWidthItem;

/**
 * @public
 */
export type RepeaterColumnLocator = IRepeaterAttributeColumnLocator | IRepeaterMeasureColumnLocator;

/**
 * Object defining the {@link IRepeaterMeasureColumnLocator} object body.
 *
 * @public
 */
export interface IRepeaterMeasureColumnLocatorBody {
    /**
     * Local identifier of the measure.
     */
    measureIdentifier: Identifier;
}

/**
 * Locates table column by column measure's localId.
 *
 * @public
 */
export interface IRepeaterMeasureColumnLocator {
    measureLocatorItem: IRepeaterMeasureColumnLocatorBody;
}

/**
 * Object defining the {@link IRepeaterAttributeColumnLocator} object body.
 *
 * @public
 */
export interface IRepeaterAttributeColumnLocatorBody {
    /**
     * Local identifier of the attribute
     */
    attributeIdentifier: Identifier;

    /**
     * Attribute element URI / primary key.
     */
    element?: string | null;
}

/**
 * Locates all columns for an attribute or columns for particular attribute element.
 *
 * @public
 */
export interface IRepeaterAttributeColumnLocator {
    attributeLocatorItem: IRepeaterAttributeColumnLocatorBody;
}
