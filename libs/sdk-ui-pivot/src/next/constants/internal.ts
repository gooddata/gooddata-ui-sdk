// (C) 2025 GoodData Corporation

import { IAttribute, IFilter, IMeasure, ITotal, ISortItem } from "@gooddata/sdk-model";
import { PivotTableNextConfig } from "../types/public.js";

/**
 * TODO: translate
 *
 * @internal
 */
export const ATTRIBUTE_EMPTY_VALUE = "(empty value)";

/**
 * @internal
 */
export const METRIC_EMPTY_VALUE = "-";

/**
 * @internal
 */
export const PIVOT_ATTRIBUTE_COLUMN_GROUP_SEPARATOR = " > ";

/**
 * @internal
 */
export const EMPTY_ATTRIBUTES: IAttribute[] = [];

/**
 * @internal
 */
export const EMPTY_METRICS: IMeasure[] = [];

/**
 * @internal
 */
export const EMPTY_FILTERS: IFilter[] = [];

/**
 * @internal
 */
export const EMPTY_TOTALS: ITotal[] = [];

/**
 * @internal
 */
export const EMPTY_CONFIG: PivotTableNextConfig = {};

/**
 * @internal
 */
export const EMPTY_SORT_BY: ISortItem[] = [];

/**
 * @internal
 */
export const COLUMNS_PER_PAGE = 1000;

/**
 * Unique identifier of the column, used for rendering metric name.
 * This is used only in case of transposition, when metrics are rendered in rows.
 *
 * @internal
 */
export const METRIC_GROUP_NAME_COL_DEF_ID = "measureGroup_name";

/**
 * Unique identifier of the column, used for rendering metric value.
 * This is used only in case of transposition, when metrics are rendered in rows.
 *
 * @internal
 */
export const METRIC_GROUP_VALUE_COL_DEF_ID = "measureGroup_value";
