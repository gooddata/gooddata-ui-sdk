// (C) 2025 GoodData Corporation
import { AgGridReactProps } from "ag-grid-react";
import { themeBalham } from "ag-grid-enterprise";
import merge from "lodash/merge.js";

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

const THEME_PROPS: AgGridReactProps = {
    theme: themeBalham,
};

const ROW_GROUPING_PROPS: AgGridReactProps = {
    groupDisplayType: "multipleColumns",
};

const SIZING_PROPS: AgGridReactProps = {
    autoSizeStrategy: {
        type: "fitCellContents",
    },
    defaultColDef: {
        resizable: true,
        autoHeight: true,
        autoHeaderHeight: true,
    },
};

const TEXT_WRAPPING_PROPS: AgGridReactProps = {
    defaultColDef: {
        wrapText: true,
        wrapHeaderText: true,
    },
};

const CELL_SELECTION_PROPS: AgGridReactProps = {
    cellSelection: {
        handle: {
            mode: "range",
        },
    },
};

const AGGREGATION_PROPS: AgGridReactProps = {
    suppressAggFuncInHeader: true,
};

const PAGING_PROPS: AgGridReactProps = {
    cacheBlockSize: AG_GRID_DEFAULT_CACHE_BLOCK_SIZE,
};

const SORTING_PROPS: AgGridReactProps = {
    defaultColDef: {
        sortable: true,
        sortingOrder: ["desc", "asc", null],
    },
};

const HEADER_PROPS: AgGridReactProps = {
    defaultColGroupDef: {
        headerClass: "gd-header-cell",
    },
};

/**
 * @internal
 */
export const AG_GRID_DEFAULT_PROPS: AgGridReactProps = merge(
    {},
    THEME_PROPS,
    ROW_GROUPING_PROPS,
    SIZING_PROPS,
    CELL_SELECTION_PROPS,
    TEXT_WRAPPING_PROPS,
    AGGREGATION_PROPS,
    PAGING_PROPS,
    SORTING_PROPS,
    HEADER_PROPS,
);
