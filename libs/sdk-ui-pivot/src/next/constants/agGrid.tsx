// (C) 2025 GoodData Corporation
import merge from "lodash/merge.js";
import { AgGridProps } from "../types/agGrid.js";
import { e } from "../features/styling/bem.js";

/**
 * Separator used for pivoted values.
 *
 * @internal
 */
export const AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR = "|";

/**
 * Default cache block size for server side row model.
 * This is basically the number of rows that will be fetched in one request.
 *
 * @internal
 */
export const AG_GRID_DEFAULT_CACHE_BLOCK_SIZE = 100;

const ROW_GROUPING_PROPS: AgGridProps = {
    groupDisplayType: "multipleColumns",
};

const SIZING_PROPS: AgGridProps = {
    defaultColDef: {
        resizable: true,
        autoHeight: true,
        autoHeaderHeight: true,
    },
};

const CELL_SELECTION_PROPS: AgGridProps = {
    cellSelection: {
        handle: {
            mode: "range",
        },
    },
};

const AGGREGATION_PROPS: AgGridProps = {
    suppressAggFuncInHeader: true,
};

const PAGING_PROPS: AgGridProps = {
    cacheBlockSize: AG_GRID_DEFAULT_CACHE_BLOCK_SIZE,
};

const SORTING_PROPS: AgGridProps = {
    defaultColDef: {
        sortable: true,
        sortingOrder: ["desc", "asc", null],
    },
};

const STYLING_PROPS: AgGridProps = {
    defaultColGroupDef: {
        headerClass: e("header-cell"),
    },
};

/**
 * @internal
 */
export const AG_GRID_DEFAULT_PROPS: AgGridProps = merge(
    {},
    ROW_GROUPING_PROPS,
    SIZING_PROPS,
    CELL_SELECTION_PROPS,
    AGGREGATION_PROPS,
    PAGING_PROPS,
    SORTING_PROPS,
    STYLING_PROPS,
);
