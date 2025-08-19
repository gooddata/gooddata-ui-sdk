// (C) 2025 GoodData Corporation

import { IAttribute, IFilter, IMeasure, ISortItem, ITotal, TotalType } from "@gooddata/sdk-model";
import { ExplicitDrill } from "@gooddata/sdk-ui";

import { IMenu } from "../types/menu.js";
import { PivotTableNextConfig } from "../types/public.js";
import { ColumnWidthItem } from "../types/resizing.js";

/**
 * TODO: translate
 * Text to display in case of attribute header is empty.
 *
 * @internal
 */
export const ATTRIBUTE_EMPTY_VALUE = "(empty value)";

/**
 * Text to display in case of measure cell is empty.
 *
 * @internal
 */
export const METRIC_EMPTY_VALUE = "–";

/**
 * Separator used to join pivoting groups (names of all attribute labels displayed in the first header row, when pivoting).
 * 
 * **Example:**
 * ```
 * |---------------------------------------------------------|
 * |         | Country > Region                              | <- pivoting group
 * |         |-----------------------|-----------------------|
 * |         | USA                   | Canada                | <- country attribute headers
 * |         |-----------------------|-----------------------|
 * | Product | East    | West        | East    | West        | <- region attribute headers
 * |---------|---------|-------------|---------|-------------|
 * ```
 
 * @internal
 */
export const PIVOTING_GROUP_SEPARATOR = " > ";

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
export const EMPTY_DRILLS: ExplicitDrill[] = [];

/**
 * @internal
 */
export const EMPTY_OBJECT = {};

/**
 * @internal
 */
export const EMPTY_COLUMN_WIDTHS: ColumnWidthItem[] = [];

/**
 * Number of columns per page.
 * We don't support paging from left to right right now, only top to bottom.
 * This is current execution maximum limit.
 *
 * @internal
 */
export const COLUMNS_PER_PAGE = 1000;

/**
 * Default page size for data fetching.
 *
 * @internal
 */
export const PAGE_SIZE = 100;

/**
 * Unique identifier of the column, used for rendering measure headers.
 * This is used only in case of transposition, when metrics are rendered in rows.
 *
 * @internal
 */
export const MEASURE_GROUP_HEADER_COL_DEF_ID = "measureGroup_name";

/**
 * Unique identifier of the column, used for rendering measure values.
 * This is used only in case of transposition, when metrics are rendered in rows.
 *
 * @internal
 */
export const MEASURE_GROUP_VALUE_COL_DEF_ID = "measureGroup_value";
export const METRIC_GROUP_VALUE_COL_DEF_ID = "measureGroup_value";

/**
 * @internal
 */
export const AVAILABLE_TOTALS: TotalType[] = ["sum", "max", "min", "avg", "med", "nat"];

/**
 * @internal
 */
export const DEFAULT_MENU_CONFIG: IMenu = {
    aggregations: false,
    aggregationsSubMenu: false,
    aggregationsSubMenuForRows: false,
    aggregationTypes: AVAILABLE_TOTALS,
};
