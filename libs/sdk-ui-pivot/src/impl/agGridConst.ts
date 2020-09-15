// (C) 2007-2020 GoodData Corporation

import { TotalType } from "@gooddata/sdk-model";

export const ROW_ATTRIBUTE_COLUMN = "ROW_ATTRIBUTE_COLUMN";
export const COLUMN_ATTRIBUTE_COLUMN = "COLUMN_ATTRIBUTE_COLUMN";
export const MEASURE_COLUMN = "MEASURE_COLUMN";
export const FIELD_SEPARATOR = "-";
export const FIELD_SEPARATOR_PLACEHOLDER = "DASH";
export const FIELD_TYPE_MEASURE = "m";
export const FIELD_TYPE_ATTRIBUTE = "a";
export const ID_SEPARATOR = "_";
export const ID_SEPARATOR_PLACEHOLDER = "UNDERSCORE";
export const DOT_PLACEHOLDER = "DOT";
export const ROW_TOTAL = "rowTotal";
export const ROW_SUBTOTAL = "rowSubtotal";
export const COLUMN_GROUPING_DELIMITER = " › ";
export const AVAILABLE_TOTALS: TotalType[] = ["sum", "max", "min", "avg", "med", "nat"];
export const COLS_PER_PAGE: number = 1000;
export const VALUE_CLASS = "s-value";
export const HEADER_LABEL_CLASS = "s-header-cell-label";
