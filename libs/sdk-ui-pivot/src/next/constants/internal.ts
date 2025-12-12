// (C) 2025 GoodData Corporation

import {
    type IAttribute,
    type IFilter,
    type IMeasure,
    type ISortItem,
    type ITotal,
    type TotalType,
} from "@gooddata/sdk-model";
import { type ExplicitDrill } from "@gooddata/sdk-ui";

import { type PivotTableNextConfig } from "../types/public.js";
import { type ColumnWidthItem } from "../types/resizing.js";

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
 * Auto page size value for accessibility mode.
 * When set, AG Grid automatically determines the page size based on the container height.
 *
 * @internal
 */
export const ACCESSIBILITY_AUTO_PAGE_SIZE = -1;

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
export const DEFAULT_TOTAL_FUNCTIONS: TotalType[] = ["sum", "max", "min", "avg", "med", "nat"];

/**
 * Note: The controller instance uses base z-index 6000 so overlays spawned by the pivot table
 * align with KD drilling overlay stacking.
 */
export const OVERLAY_CONTROLLER_Z_INDEX = 6000;
