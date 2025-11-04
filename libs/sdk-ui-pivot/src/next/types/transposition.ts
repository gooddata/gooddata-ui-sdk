// (C) 2025 GoodData Corporation

/**
 * Whether to display measures in columns or rows (transposed).
 *
 * This affects how execution and result of the table is constructed:
 * - "columns" - measures are included in the first dimension (top to bottom).
 * - "rows" - measures are included in the second dimension (left to right).
 *
 * @public
 */
export type MeasureGroupDimension = "columns" | "rows";

/**
 * @public
 */
export type ColumnHeadersPosition = "left" | "top";

/**
 * @public
 */
export type PivotTableNextTranspositionConfig = {
    /**
     * Whether to display measures in columns or rows (transposed).
     *
     * This affects how execution and result of the table is constructed:
     * - "columns" - measures are included in the first dimension (top to bottom).
     * - "rows" - measures are included in the second dimension (left to right).
     *
     * Default Value: "columns"
     */
    measureGroupDimension?: MeasureGroupDimension;

    /**
     * Whether to display column headers on the top or left.
     *
     * Default value: "left"
     */
    columnHeadersPosition?: ColumnHeadersPosition;
};
