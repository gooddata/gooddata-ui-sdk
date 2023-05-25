// (C) 2007-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { attributeLocalId, IAttribute, Identifier, IMeasure, measureLocalId } from "@gooddata/sdk-model";

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
 * Object defining the {@link IAttributeColumnWidthItem} object body.
 *
 * @public
 */
export interface IAttributeColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
    attributeIdentifier: Identifier;
}

/**
 * @public
 */
export interface IAttributeColumnWidthItem {
    attributeColumnWidthItem: IAttributeColumnWidthItemBody;
}

/**
 * Object defining the {@link IMeasureColumnWidthItem} object body.
 *
 * @public
 */
export interface IMeasureColumnWidthItemBody {
    width: ColumnWidth;
    locators: ColumnLocator[];
}

/**
 * @public
 */
export interface IMeasureColumnWidthItem {
    measureColumnWidthItem: IMeasureColumnWidthItemBody;
}

/**
 * Object defining {@link IAllMeasureColumnWidthItem} object body.
 *
 * @public
 */
export interface IAllMeasureColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
}

/**
 * @public
 */
export interface IAllMeasureColumnWidthItem {
    measureColumnWidthItem: IAllMeasureColumnWidthItemBody;
}

/**
 * Object defining the {@link IWeakMeasureColumnWidthItem} object body.
 *
 * @public
 */
export interface IWeakMeasureColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
    locator: IMeasureColumnLocator;
}

/**
 * @public
 */
export interface IWeakMeasureColumnWidthItem {
    measureColumnWidthItem: IWeakMeasureColumnWidthItemBody;
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
export type ColumnLocator = IAttributeColumnLocator | IMeasureColumnLocator | ITotalColumnLocator;

/**
 * Object defining the {@link IMeasureColumnLocator} object body.
 *
 * @public
 */
export interface IMeasureColumnLocatorBody {
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
export interface IMeasureColumnLocator {
    measureLocatorItem: IMeasureColumnLocatorBody;
}

/**
 * Object defining the {@link IAttributeColumnLocator} object body.
 *
 * @public
 */
export interface IAttributeColumnLocatorBody {
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
 * Object defining the {@link ITotalColumnLocator} object body.
 *
 * @public
 */
export interface ITotalColumnLocatorBody {
    /**
     * Local identifier of the attribute inside which the subtotal is put
     */
    attributeIdentifier: Identifier;

    /**
     * Function for the total, such as sum, max, min, ...
     */
    totalFunction: string;
}

/**
 * Locates all columns for an attribute or columns for particular attribute element.
 *
 * @public
 */
export interface IAttributeColumnLocator {
    attributeLocatorItem: IAttributeColumnLocatorBody;
}

/**
 * Locates all columns for a columns for particular total.
 *
 * @public
 */
export interface ITotalColumnLocator {
    totalLocatorItem: ITotalColumnLocatorBody;
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
 * Tests whether object is an instance of {@link TotalColumnLocator}
 *
 * @public
 */
export function isTotalColumnLocator(obj: unknown): obj is ITotalColumnLocator {
    return !isEmpty(obj) && (obj as ITotalColumnLocator).totalLocatorItem !== undefined;
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

/**
 * @internal
 */
export function newMeasureColumnLocator(measureOrId: IMeasure | string): IMeasureColumnLocator {
    const measureIdentifier = measureLocalId(measureOrId);

    return {
        measureLocatorItem: {
            measureIdentifier,
        },
    };
}

/**
 * Creates width item that will set width of a column which contains values of a row attribute.
 *
 * @param attributeOrId - Attribute specified by value or by localId reference
 * @param width - Width in pixels
 * @param allowGrowToFit - indicates whether the column is allowed to grow if the table's growToFit is enabled
 * @public
 */
export function newWidthForAttributeColumn(
    attributeOrId: IAttribute | string,
    width: number,
    allowGrowToFit?: boolean,
): IAttributeColumnWidthItem {
    const growToFitProp = allowGrowToFit !== undefined ? { allowGrowToFit } : {};

    return {
        attributeColumnWidthItem: {
            attributeIdentifier: attributeLocalId(attributeOrId),
            width: {
                value: width,
                ...growToFitProp,
            },
        },
    };
}

/**
 * Creates width item that will set width for all measure columns in the table.
 *
 * @param width - Width in pixels
 * @param allowGrowToFit - indicates whether the column is allowed to grow if the table's growToFit is enabled
 * @public
 */
export function newWidthForAllMeasureColumns(
    width: number,
    allowGrowToFit?: boolean,
): IAllMeasureColumnWidthItem {
    const growToFitProp = allowGrowToFit !== undefined ? { allowGrowToFit } : {};

    return {
        measureColumnWidthItem: {
            width: {
                value: width,
                ...growToFitProp,
            },
        },
    };
}

/**
 * Creates width item that will set width for all columns containing values of the provided measure.
 *
 * @param measureOrId - Measure specified either by value or by localId reference
 * @param width - Width in pixels
 * @param allowGrowToFit - indicates whether the column is allowed to grow if the table's growToFit is enabled
 * @public
 */
export function newWidthForAllColumnsForMeasure(
    measureOrId: IMeasure | string,
    width: number,
    allowGrowToFit?: boolean,
): IWeakMeasureColumnWidthItem {
    const locator = newMeasureColumnLocator(measureOrId);
    const growToFitProp = allowGrowToFit !== undefined ? { allowGrowToFit } : {};

    return {
        measureColumnWidthItem: {
            width: {
                value: width,
                ...growToFitProp,
            },
            locator,
        },
    };
}

/**
 * Creates width item that will set width for all columns containing values of the provided measure.
 *
 * @remarks
 * See also {@link newAttributeColumnLocator} to learn more about the attribute column locators.
 *
 * @param measureOrId - Measure specified either by value or by localId reference
 * @param locators - Attribute locators to narrow down selection
 * @param width - Width in pixels
 * @param allowGrowToFit - indicates whether the column is allowed to grow if the table's growToFit is enabled
 * @public
 */
export function newWidthForSelectedColumns(
    measureOrId: IMeasure | string,
    locators: IAttributeColumnLocator[],
    width: number | "auto",
    allowGrowToFit?: boolean,
): IMeasureColumnWidthItem {
    const measureLocator = newMeasureColumnLocator(measureOrId);
    const growToFitProp = allowGrowToFit !== undefined && width !== "auto" ? { allowGrowToFit } : {};

    // Note: beware here. The attribute locators _must_ come first for some obscure, impl dependent reason
    return {
        measureColumnWidthItem: {
            width: {
                value: width,
                ...growToFitProp,
            },
            locators: [...locators, measureLocator],
        },
    };
}

/**
 * Creates a new attribute column locator
 *
 * @remarks
 * This is used to narrow down location of measure columns in pivot table, where
 * measures are further scoped by different attribute elements - imagine pivot table with defined for measure 'Amount' and column
 * attribute 'Product'. The table will have multiple columns for the 'Amount' measure - each for different element of the
 * 'Product' attribute. In this context, identifying particular measure columns needs to be more specific.
 *
 * The attribute column locator can match either single element of particular attribute, or all elements of particular
 * attribute.
 *
 * @param attributeOrId - Column attribute specified by either value or by localId reference
 * @param element - specify attribute element URI or primary key; if not specified, the locator will match
 *  all elements of the attribute
 * @public
 */
export function newAttributeColumnLocator(
    attributeOrId: IAttribute | string,
    element?: string,
): IAttributeColumnLocator {
    return {
        attributeLocatorItem: {
            attributeIdentifier: attributeLocalId(attributeOrId),
            element,
        },
    };
}
