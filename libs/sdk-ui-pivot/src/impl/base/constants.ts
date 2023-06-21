// (C) 2007-2021 GoodData Corporation

import { TotalType } from "@gooddata/sdk-model";

export const ROW_ATTRIBUTE_COLUMN = "ROW_ATTRIBUTE_COLUMN";
export const COLUMN_ATTRIBUTE_COLUMN = "COLUMN_ATTRIBUTE_COLUMN";
export const MEASURE_COLUMN = "MEASURE_COLUMN";
export const ROW_MEASURE_COLUMN = "ROW_MEASURE_COLUMN";
export const MIXED_HEADERS_COLUMN = "MIXED_HEADERS_COLUMN";
export const MIXED_VALUES_COLUMN = "MIXED_VALUES_COLUMN";
export const ROW_TOTAL = "rowTotal";
export const ROW_SUBTOTAL = "rowSubtotal";
export const COLUMN_TOTAL = "COLUMN_TOTAL";
export const COLUMN_SUBTOTAL = "COLUMN_SUBTOTAL";
export const COLUMN_GROUPING_DELIMITER = " › ";
export const AVAILABLE_TOTALS: TotalType[] = ["sum", "max", "min", "avg", "med", "nat"];
export const COLS_PER_PAGE: number = 1000;
export const VALUE_CLASS = "s-value";
export const HEADER_LABEL_CLASS = "s-header-cell-label";
export const ROW_TOTAL_CLASS = "gd-row-total";
export const ROW_SUBTOTAL_CLASS = "gd-table-row-subtotal";
export const COLUMN_TOTAL_CLASS = "gd-column-total";
export const COLUMN_SUBTOTAL_CLASS = "gd-column-subtotal";
export const DEFAULT_HEADER_FONT = '12px / 28px gdcustomfont, avenir, "Helvetica Neue", arial, sans-serif';
export const DEFAULT_ROW_FONT = '12px / 26px gdcustomfont, avenir, "Helvetica Neue", arial, sans-serif';
export const DEFAULT_SUBTOTAL_FONT =
    '700 12px / 26px gdcustomfont, avenir, "Helvetica Neue", arial, sans-serif';
export const DEFAULT_TOTAL_FONT = '700 12px / 26px gdcustomfont, avenir, "Helvetica Neue", arial, sans-serif';

/**
 * DEFAULT_AUTOSIZE_PADDING needs to match real padding from styles
 */
export const DEFAULT_AUTOSIZE_PADDING = 12;
export const DEFAULT_ROW_HEIGHT = 28;
