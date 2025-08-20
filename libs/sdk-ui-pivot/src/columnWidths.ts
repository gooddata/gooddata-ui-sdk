// (C) 2007-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

import { IAttribute, IMeasure, Identifier, attributeLocalId, measureLocalId } from "@gooddata/sdk-model";

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
 * Object defining the {@link ISliceMeasureColumnWidthItem } object body.
 *
 * @public
 */
export interface ISliceMeasureColumnWidthItemBody {
    width: ColumnWidth;
    locators: IMeasureColumnLocator[];
}

/**
 * @public
 */
export interface ISliceMeasureColumnWidthItem {
    sliceMeasureColumnWidthItem: ISliceMeasureColumnWidthItemBody;
}

/**
 * Object defining the {@link IMixedValuesColumnWidthItemBody } object body.
 *
 * @public
 */
export interface IMixedValuesColumnWidthItemBody {
    width: ColumnWidth;
    locators: IMeasureColumnLocator[];
}

/**
 * @public
 */
export interface IMixedValuesColumnWidthItem {
    mixedValuesColumnWidthItem: IMixedValuesColumnWidthItemBody;
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
    | ISliceMeasureColumnWidthItem
    | IMixedValuesColumnWidthItem
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
 * Tests whether object is an instance of {@link ITotalColumnLocator}
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
    return !isEmpty(obj) && (obj as IMeasureColumnWidthItem).measureColumnWidthItem?.locators !== undefined;
}

/**
 * Tests whether object is an instance of {@link ISliceMeasureColumnWidthItem}
 *
 * @public
 */
export function isSliceMeasureColumnWidthItem(obj: unknown): obj is ISliceMeasureColumnWidthItem {
    return (
        !isEmpty(obj) &&
        (obj as ISliceMeasureColumnWidthItem).sliceMeasureColumnWidthItem?.locators !== undefined
    );
}

/**
 * Tests whether object is an instance of {@link IMixedValuesColumnWidthItem}
 *
 * @public
 */
export function isMixedValuesColumnWidthItem(obj: unknown): obj is IMixedValuesColumnWidthItem {
    return (
        !isEmpty(obj) &&
        (obj as IMixedValuesColumnWidthItem).mixedValuesColumnWidthItem?.locators !== undefined
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
        !isEmpty(obj) && (obj as IWeakMeasureColumnWidthItem).measureColumnWidthItem?.locator !== undefined
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
 * Creates a new total column locator
 *
 * @param attributeOrId - Column attribute specified by either value or by localId reference
 * @param totalFunction - Function for the total, such as sum, max, min...
 * @alpha
 */
export function newTotalColumnLocator(
    attributeOrId: IAttribute | string,
    totalFunction: string,
): ITotalColumnLocator {
    return {
        totalLocatorItem: {
            attributeIdentifier: attributeLocalId(attributeOrId),
            totalFunction,
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
    const growToFitProp = allowGrowToFit === undefined ? {} : { allowGrowToFit };

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
    const growToFitProp = allowGrowToFit === undefined ? {} : { allowGrowToFit };

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
    const growToFitProp = allowGrowToFit === undefined ? {} : { allowGrowToFit };

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
 * To prepare width items for columns in tables without measures, pass measureOrId as `null`.
 *
 * @remarks
 * See also {@link newAttributeColumnLocator} to learn more about the attribute column locators.
 *
 * @param measureOrId - Measure specified either by value or by localId reference
 * @param locators - Attribute locators to narrow down selection
 * @param width - Width in pixels
 * @param allowGrowToFit - indicates whether the column is allowed to grow if the table's growToFit is enabled
   @deprecated this method is deprecated, please use {@link setNewWidthForSelectedColumns} instead.
 * @public
 */
export function newWidthForSelectedColumns(
    measureOrId: IMeasure | string,
    locators: (IAttributeColumnLocator | ITotalColumnLocator)[],
    width: number | "auto",
    allowGrowToFit?: boolean,
): IMeasureColumnWidthItem {
    return setNewWidthForSelectedColumns(measureOrId, locators, width, allowGrowToFit);
}

/**
 * Creates width item that will set width for all columns containing values of the provided measure.
 * To prepare width items for columns in tables without measures, pass measureOrId as `null`.
 *
 * @remarks
 * See also {@link newAttributeColumnLocator} to learn more about the attribute column locators.
 *
 * @param measuresOrIds - Measures specified either by value or by localId reference
 * @param locators - Attribute locators to narrow down selection
 * @param width - Width in pixels
 * @param allowGrowToFit - indicates whether the column is allowed to grow if the table's growToFit is enabled
 * @public
 */
export function setNewWidthForSelectedColumns(
    measuresOrIds: IMeasure | string | IMeasure[] | string[] | null,
    locators: (IAttributeColumnLocator | ITotalColumnLocator)[],
    width: number | "auto",
    allowGrowToFit?: boolean,
): IMeasureColumnWidthItem {
    let measureLocators: IMeasureColumnLocator[] = [];

    if (Array.isArray(measuresOrIds)) {
        measureLocators = measuresOrIds.map(newMeasureColumnLocator);
    } else if (measuresOrIds) {
        measureLocators.push(newMeasureColumnLocator(measuresOrIds));
    }

    const growToFitProp = allowGrowToFit !== undefined && width !== "auto" ? { allowGrowToFit } : {};

    // Note: beware here. The attribute locators _must_ come first for some obscure, impl dependent reason
    return {
        measureColumnWidthItem: {
            width: {
                value: width,
                ...growToFitProp,
            },
            locators: [...locators, ...measureLocators],
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
