// (C) 2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { IAttribute, IMeasure, Identifier, attributeLocalId } from "@gooddata/sdk-model";

import {
    ColumnLocator,
    IAttributeColumnLocator,
    IMeasureColumnLocator,
    ITotalColumnLocator,
    newMeasureColumnLocator,
} from "./locators.js";

/**
 * @public
 */
export type PivotTableNextColumnsSizingConfig = {
    /**
     * Customize column sizing strategy.
     */
    columnSizing?: IColumnSizing;
};

/**
 * @public
 */
export type ColumnResizedCallback = (columnWidths: ColumnWidthItem[]) => void;

/**
 * @public
 */
export type DefaultColumnWidth = "unset" | "autoresizeAll" | "viewport";

/**
 * @public
 */
export interface IColumnSizing {
    /**
     * Indicate that the table should grow to fit into the allocated space.
     *
     * @remarks
     * Default: false
     */
    growToFit?: boolean;

    /**
     * Specify whether columns should be resized to fill the entire viewport.
     *
     * @remarks
     * Default: unset
     */
    defaultWidth?: DefaultColumnWidth;

    /**
     * Specify custom column widths to apply.
     *
     * @remarks
     * Default: none
     */
    columnWidths?: ColumnWidthItem[];
}

//
// types used in implementation internals
//

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
