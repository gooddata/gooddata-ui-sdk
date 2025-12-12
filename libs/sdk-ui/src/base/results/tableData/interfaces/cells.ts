// (C) 2019-2025 GoodData Corporation
import { isEmpty } from "lodash-es";

import {
    type DataValue,
    type IResultAttributeHeader,
    type IResultMeasureHeader,
    type IResultTotalHeader,
} from "@gooddata/sdk-model";

import {
    type ITableAttributeColumnDefinition,
    type ITableGrandTotalColumnDefinition,
    type ITableMeasureGroupHeaderColumnDefinition,
    type ITableMeasureGroupValueColumnDefinition,
    type ITableSubtotalColumnDefinition,
    type ITableValueColumnDefinition,
} from "./columns.js";
import {
    type ITableGrandTotalRowDefinition,
    type ITableSubtotalRowDefinition,
    type ITableValueRowDefinition,
} from "./rows.js";

/**
 * Union of **all possible cell value shapes** that can appear in the table
 * `data` matrix. Each variant corresponds to a concrete column × row
 * intersection produced by `dataViewToTableData`.
 *
 * - Header cells (`attributeHeader`, `measureHeader`, `totalHeader`)
 * - Numeric cells with raw measure data (`value`)
 * - Aggregations (`subtotalValue`, `grandTotalValue`, `grandTotalSubtotalValue`, `overallTotalValue`)
 *
 * When interpreting the `data` matrix you should always rely on the concrete subtype.
 *
 * **Example table without transposition:**
 * ```
 * Attr A    | Col A   | Sum A   | ColSum Σ |
 * ----------+---------+---------+----------+
 * Row X     |  100    |  200    | 300      |
 * Sum B     |  400    |  600    | 1000     |
 * RowSum Σ  |  500    |  800    | 1300     |
 * ```
 * - Attr A is attribute column, Col A is value column, Sum A is subtotal column, ColSum Σ is grand total column
 * - Row X is value row, Sum B is subtotal row, RowSum Σ is grand total row
 *
 * In this example:
 * - Row X is `attributeHeader`
 * - Sum B is `totalHeader`
 * - RowSum Σ is `grandTotalHeader`
 * - Row X : Col A - `100` is `value`
 * - Row X : Sum A - `200` is `subtotalValue`
 * - Row X : ColSum Σ - `300` is `grandTotalValue`
 * - Sum B : Col A - `400` is `subtotalValue`
 * - Sum B : Sum A - `600` is `subtotalValue`
 * - Sum B : ColSum Σ - `1000` is `grandTotalSubtotalValue`
 * - RowSum Σ : Col A - `500` is `grandTotalValue`
 * - RowSum Σ : Sum A - `800` is `grandTotalSubtotalValue`
 * - RowSum Σ : ColSum Σ - `1300` is `overallTotalValue`
 *
 * @alpha
 */
export type ITableDataValue =
    | ITableAttributeHeaderValue
    | ITableMeasureHeaderValue
    | ITableTotalHeaderValue
    | ITableMeasureValue
    | ITableSubtotalMeasureValue
    | ITableGrandTotalHeaderValue
    | ITableGrandTotalMeasureValue
    | ITableGrandTotalSubtotalMeasureValue
    | ITableOverallTotalMeasureValue;

/**
 * Cell located in {@link ITableAttributeColumnDefinition} – typically the leftmost
 * part of the table describing the current row's attribute values.
 *
 * It represents a single `IResultAttributeHeader` coming from the execution
 * response and can be present in both value rows and subtotal rows.
 *
 * **Visual example**
 * ```
 *  Attribute | Measure |
 * -----------+---------+
 *  USA       |  100    | <- "USA" is attributeHeader
 * ```
 *
 * @alpha
 */
export interface ITableAttributeHeaderValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "attributeHeader";
    /**
     * Attribute element value ready to be rendered. (e.g. "United States")
     */
    formattedValue: string | null;
    /**
     * The raw `IResultAttributeHeader` object from the execution response.
     */
    value: IResultAttributeHeader;
    /**
     * Zero-based row position of this cell in the final `data` matrix.
     */
    rowIndex: number;
    /**
     * Zero-based column position of this cell in the final `data` matrix.
     */
    columnIndex: number;
    /**
     * Full row context describing which row this cell belongs to
     * (value, subtotal, or grand-total row).
     */
    rowDefinition: ITableValueRowDefinition | ITableSubtotalRowDefinition;
    /**
     * Full column context describing which attribute column this cell belongs to.
     * Always an attribute column since this interface is for attribute headers.
     */
    columnDefinition: ITableAttributeColumnDefinition;
}

/**
 * Cell inside the {@link ITableMeasureGroupHeaderColumnDefinition}.
 * Appears **only when measures are transposed into rows**.
 * Each cell corresponds to one `IResultMeasureHeader` and labels the measure for that specific row.
 *
 * **Visual example**
 * ```
 *  Attribute | Measure | Value |
 * -----------+---------+-------+
 *  USA       |  Sales  |  100  | <- "Sales" is measureHeader
 *  USA       |  Cost   |   80  | <- "Cost" is measureHeader
 * ```
 * The "Sales" and "Cost" **names** in the "Measure" column are `measureHeader` cells.
 * The numeric values (100, 80) are regular `value` cells.
 *
 * **When measures are in columns (no transposition), this interface is NOT used.**
 * Instead, measure names appear as regular column headers in the table structure.
 *
 * @alpha
 */
export interface ITableMeasureHeaderValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "measureHeader";
    /**
     * Display name of the measure (e.g., "Sales", "Revenue").
     */
    formattedValue: string | null;
    /**
     * The raw `IResultMeasureHeader` object.
     */
    value: IResultMeasureHeader;
    /**
     * Zero-based row position in the `data` matrix.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     */
    columnIndex: number;
    /**
     * Row context - can be only value row.
     */
    rowDefinition: ITableValueRowDefinition;
    /**
     * Column context - always a `measureGroupHeader` column.
     */
    columnDefinition: ITableMeasureGroupHeaderColumnDefinition;
}

/**
 * Cell that represents total header.
 * Each cell corresponds to one `IResultTotalHeader` and labels the total for that specific row / column.
 *
 * **Visual example**
 * ```
 *  Attribute | Value |
 * -----------+-------+
 *  USA       |  100  |
 *  Sum A     |   80  | <- "Sum A" is totalHeader
 * ```
 *
 * @alpha
 */
export interface ITableTotalHeaderValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "totalHeader";
    /**
     * Display text for the total header (e.g., "Sum", "Avg", "Max").
     */
    formattedValue: string | null;
    /**
     * The raw `IResultTotalHeader` object containing total metadata
     * like totalType, measureIndex, etc.
     */
    value: IResultTotalHeader;
    /**
     * Zero-based row position in the `data` matrix.
     * Usually points to a subtotal or grand-total row.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     * Points to the measure header column when measures are transposed.
     */
    columnIndex: number;
    /**
     * Row context - subtotal or value row.
     */
    rowDefinition: ITableValueRowDefinition | ITableSubtotalRowDefinition;
    /**
     * Column context - value column, subtotal column, measure group header column, or attribute column.
     */
    columnDefinition:
        | ITableValueColumnDefinition
        | ITableSubtotalColumnDefinition
        | ITableMeasureGroupHeaderColumnDefinition
        | ITableAttributeColumnDefinition;
}

/**
 * Numeric cell containing a **raw measure value** for regular (non-aggregated) row/column intersections.
 *
 * **Visual examples:**
 * ```
 * // Normal (measures in columns):
 * Country    | Sales  |
 * -----------+--------+
 *  USA       |  100   | <- 100 is value cell
 *
 * // Transposed (measures in rows):
 * Country    |         |       |
 * -----------+---------+-------+
 *  USA       |  Sales  |  100  | <- 100 is value cell
 * ```
 *
 * @alpha
 */
export interface ITableMeasureValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "value";
    /**
     * Human-readable formatted number ready for display (e.g., "$1,234.56").
     * Formatted using the measure's format string and respects locale settings.
     * Null if the raw value is null/missing.
     */
    formattedValue: string | null;
    /**
     * Raw numeric value from the backend execution response.
     * Can be number, string, or null depending on the measure data.
     */
    value: DataValue;
    /**
     * Zero-based row position in the `data` matrix.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     */
    columnIndex: number;
    /**
     * Row context - value or subtotal row.
     */
    rowDefinition: ITableValueRowDefinition | ITableSubtotalRowDefinition;
    /**
     * Column context - value column or measureGroupValue column.
     */
    columnDefinition: ITableValueColumnDefinition | ITableMeasureGroupValueColumnDefinition;
}

/**
 * Numeric cell containing **subtotals** aggregated across sibling rows/columns.
 *
 * **Visual example**
 * ```
 * // Row subtotal:
 *            | Sales  |
 * -----------+--------+
 *  USA       |  100   |
 *  Sum A     |  170   | <- 170 is subtotalValue
 *
 * // Column subtotal:
 *            | Q1  | Sum A   |
 * -----------+-----+---------+
 *  USA       | 100 |   220   | <- 220 is subtotalValue
 * ```
 *
 * @alpha
 */
export interface ITableSubtotalMeasureValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "subtotalValue";
    /**
     * Human-readable formatted subtotal value (e.g., "$2,345.67").
     */
    formattedValue: string | null;
    /**
     * Raw aggregated subtotal value from the backend.
     * Result of summing/averaging/etc. across sibling rows or columns.
     */
    value: DataValue;
    /**
     * Zero-based row position in the `data` matrix.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     */
    columnIndex: number;
    /**
     * Row context - value or subtotal row.
     */
    rowDefinition: ITableValueRowDefinition | ITableSubtotalRowDefinition;
    /**
     * Column context - value column or subtotal column.
     */
    columnDefinition: ITableValueColumnDefinition | ITableSubtotalColumnDefinition;
}

/**
 * Numeric cell containing **grand totals** – totals across rows or columns.
 *
 * **Visual example**
 * ```
 * // Column grand total:
 *            |  Q1 | ColSum Σ |
 * -----------+-----+----------+
 *  USA       | 100 |   220    | <- 220 is grandTotalValue
 *
 * // Row grand total:
 *            |  Q1 |  Q2 |
 * -----------+-----+-----+
 *  USA       | 100 | 120 |
 *  RowSum Σ  | 180 | 210 | <- 180 and 210 are grandTotalValue cells
 * ```
 *
 * @alpha
 */
export interface ITableGrandTotalMeasureValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "grandTotalValue";
    /**
     * Human-readable formatted grand total value (e.g., "$10,000.00").
     * Uses the measure's format string and locale settings.
     */
    formattedValue: string | null;
    /**
     * Raw aggregated grand total value from the backend.
     * Result of aggregating across all rows or columns for this measure.
     */
    value: DataValue;
    /**
     * Zero-based row position in the `data` matrix.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     */
    columnIndex: number;
    /**
     * Row context - value or grand-total row.
     */
    rowDefinition: ITableValueRowDefinition | ITableGrandTotalRowDefinition;
    /**
     * Column context - value column, grand-total column, or measure group value column.
     */
    columnDefinition:
        | ITableValueColumnDefinition
        | ITableGrandTotalColumnDefinition
        | ITableMeasureGroupValueColumnDefinition;
}

/**
 * Numeric cell at the **intersection of row and column subtotals + grandtotals** – the *subtotals of grandtotals*.
 *
 * **Visual example**
 * ```
 * // Column grand total + row subtotal:
 *            |  Q1 | ColSum Σ |
 * -----------+-----+----------+
 *  Sum A     | 100 |   220    | <- 220 is grandTotalSubtotalValue
 *
 * // Row grand total + column subtotal:
 *            |  Q1 | Sum A |
 * -----------+-----+-------+
 *  USA       | 100 | 120   |
 *  RowSum Σ  | 180 | 210   | <- 210 is grandTotalSubtotalValue
 * ```
 *
 * @alpha
 */
export interface ITableGrandTotalSubtotalMeasureValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "grandTotalSubtotalValue";
    /**
     * Human-readable formatted intersection total value (e.g., "$15,000.00").
     */
    formattedValue: string | null;
    /**
     * Raw aggregated value at the intersection of row and column totals.
     */
    value: DataValue;
    /**
     * Zero-based row position in the `data` matrix.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     */
    columnIndex: number;
    /**
     * Row context - grand-total row or subtotal row.
     */
    rowDefinition: ITableSubtotalRowDefinition | ITableGrandTotalRowDefinition;
    /**
     * Column context - subtotal column or grand-total column.
     */
    columnDefinition: ITableSubtotalColumnDefinition | ITableGrandTotalColumnDefinition;
}

/**
 * Numeric cell at the **overall grand-total** intersection (bottom-right corner)
 * aggregating across *all* rows and columns.
 *
 * **Visual example:**
 * ```
 *            |  Q1 |  Q2 | ColSum Σ |
 * -----------+-----+-----+----------+
 *  USA       | 100 | 120 |   220    |
 *  CAN       |  80 |  90 |   170    |
 *  RowSum Σ  | 180 | 210 |   390    | <- 390 is overallTotalValue
 * ```
 *
 * @alpha
 */
export interface ITableOverallTotalMeasureValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "overallTotalValue";
    /**
     * Human-readable formatted overall total value (e.g., "$50,000.00").
     */
    formattedValue: string | null;
    /**
     * Raw overall total value from the backend.
     */
    value: DataValue;
    /**
     * Zero-based row position in the `data` matrix.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     */
    columnIndex: number;
    /**
     * Row context - grand-total row since this is the
     * grand-total row × grand-total column intersection.
     */
    rowDefinition: ITableGrandTotalRowDefinition;
    /**
     * Column context - grand-total column since this is the
     * grand-total row × grand-total column intersection.
     */
    columnDefinition: ITableGrandTotalColumnDefinition;
}

/**
 * Header cell labeling a **grand-total row** (usually located in the first columns).
 *
 * **Visual example:**
 * ```
 *            |  Q1 |  Q2 | ColSum Σ |
 * -----------+-----+-----+----------+
 *  USA       | 100 | 120 |   220    |
 *  CAN       |  80 |  90 |   170    |
 *  RowSum Σ  | 180 | 210 |   390    | <- RowSum Σ is grandTotalHeader
 * ```
 *
 * @alpha
 */
export interface ITableGrandTotalHeaderValue {
    /**
     * Discriminator literal for narrowing the `ITableDataValue` union.
     */
    type: "grandTotalHeader";
    /**
     * Display text for the grand total row label (e.g., "Sum", "Total").
     * Usually shows the aggregation type or a localized "Total" label.
     */
    formattedValue: string | null;
    /**
     * Zero-based row position in the `data` matrix.
     * Points to a grand-total row that this header cell labels.
     */
    rowIndex: number;
    /**
     * Zero-based column position in the `data` matrix.
     * Usually points to the first attribute column (leftmost) or
     * measure header column (when measures are transposed).
     */
    columnIndex: number;
    /**
     * Row context - grand-total row since this header
     * cell is labeling a grand-total row.
     */
    rowDefinition: ITableGrandTotalRowDefinition;
    /**
     * Column context - typically an attribute column or measure header column
     * where the grand total label appears.
     */
    columnDefinition: ITableAttributeColumnDefinition | ITableMeasureGroupHeaderColumnDefinition;
}

/**
 * Type guard checking whether input is an instance of {@link ITableAttributeHeaderValue}
 *
 * @alpha
 */
export function isTableAttributeHeaderValue(obj: unknown): obj is ITableAttributeHeaderValue {
    return !isEmpty(obj) && (obj as ITableAttributeHeaderValue).type === "attributeHeader";
}

/**
 * Type guard checking whether input is an instance of {@link ITableMeasureHeaderValue}
 *
 * @alpha
 */
export function isTableMeasureHeaderValue(obj: unknown): obj is ITableMeasureHeaderValue {
    return !isEmpty(obj) && (obj as ITableMeasureHeaderValue).type === "measureHeader";
}

/**
 * Type guard checking whether input is an instance of {@link ITableTotalHeaderValue}
 *
 * @alpha
 */
export function isTableTotalHeaderValue(obj: unknown): obj is ITableTotalHeaderValue {
    return !isEmpty(obj) && (obj as ITableTotalHeaderValue).type === "totalHeader";
}

/**
 * Type guard checking whether input is an instance of {@link ITableMeasureValue}
 *
 * @alpha
 */
export function isTableMeasureValue(obj: unknown): obj is ITableMeasureValue {
    return !isEmpty(obj) && (obj as ITableMeasureValue).type === "value";
}

/**
 * Type guard checking whether input is an instance of {@link ITableSubtotalMeasureValue}
 *
 * @alpha
 */
export function isTableSubtotalMeasureValue(obj: unknown): obj is ITableSubtotalMeasureValue {
    return !isEmpty(obj) && (obj as ITableSubtotalMeasureValue).type === "subtotalValue";
}

/**
 * Type guard checking whether input is an instance of {@link ITableGrandTotalMeasureValue}
 *
 * @alpha
 */
export function isTableGrandTotalMeasureValue(obj: unknown): obj is ITableGrandTotalMeasureValue {
    return !isEmpty(obj) && (obj as ITableGrandTotalMeasureValue).type === "grandTotalValue";
}

/**
 * Type guard checking whether input is an instance of {@link ITableGrandTotalSubtotalMeasureValue}
 *
 * @alpha
 */
export function isTableGrandTotalSubtotalMeasureValue(
    obj: unknown,
): obj is ITableGrandTotalSubtotalMeasureValue {
    return !isEmpty(obj) && (obj as ITableGrandTotalSubtotalMeasureValue).type === "grandTotalSubtotalValue";
}

/**
 * Type guard checking whether input is an instance of {@link ITableOverallTotalMeasureValue}
 *
 * @alpha
 */
export function isTableOverallTotalMeasureValue(obj: unknown): obj is ITableOverallTotalMeasureValue {
    return !isEmpty(obj) && (obj as ITableOverallTotalMeasureValue).type === "overallTotalValue";
}

/**
 * Type guard checking whether input is an instance of {@link ITableGrandTotalHeaderValue}
 *
 * @alpha
 */
export function isTableGrandTotalHeaderValue(obj: unknown): obj is ITableGrandTotalHeaderValue {
    return !isEmpty(obj) && (obj as ITableGrandTotalHeaderValue).type === "grandTotalHeader";
}
