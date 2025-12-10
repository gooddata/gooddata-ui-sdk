// (C) 2025 GoodData Corporation

import { merge } from "lodash-es";

import { LoadingComponent } from "@gooddata/sdk-ui";

import { HEADER_CELL_CLASSNAME } from "../features/styling/bem.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Separator used to generate colId for pivoted values (by joining local identifiers and header values of the pivoting path to the value).
 * @internal
 */
export const AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR = "|";

const DEFAULT_ROW_HEIGHT = 28;

const ROW_GROUPING_PROPS: AgGridProps = {
    groupDisplayType: "multipleColumns",
};

const COLUMN_PROPS: AgGridProps = {
    suppressMovableColumns: true,
};

const SIZING_PROPS: AgGridProps = {
    defaultColDef: {
        minWidth: 64,
        resizable: true,
    },
    autoSizePadding: 8,
};

const CELL_SELECTION_PROPS: AgGridProps = {
    cellSelection: true,
    suppressCellFocus: false,
};

const NAVIGATION_PROPS: AgGridProps = {
    // Disable Tab navigation within the grid - Tab should exit the grid (browser default)
    // Returning false prevents AG Grid's default Tab behavior
    tabToNextCell: () => false,
    tabToNextHeader: () => false,
    // Set tabindex="-1" ONLY on rows (not cells!) to prevent Tab from focusing rows
    // Cells need to keep their tabindex so AG Grid can manage focus and call suppressKeyboardEvent
    processRowPostCreate: (params) => {
        params.eRow.setAttribute("tabindex", "-1");
    },
};

const PAGINATION_PROPS: AgGridProps = {
    paginationPageSizeSelector: false,
};

const AGGREGATION_PROPS: AgGridProps = {
    suppressAggFuncInHeader: true,
};

const SORTING_PROPS: AgGridProps = {
    alwaysMultiSort: false,
    defaultColDef: {
        sortable: true,
        sortingOrder: ["desc", "asc", null],
    },
};

const STYLING_PROPS: AgGridProps = {
    defaultColGroupDef: {
        headerClass: HEADER_CELL_CLASSNAME,
    },
    rowHeight: DEFAULT_ROW_HEIGHT,
};

const LOADING_PROPS: AgGridProps = {
    loading: true,
    loadingOverlayComponent: LoadingComponent,
    suppressServerSideFullWidthLoadingRow: true,
};

const HEADER_PROPS: AgGridProps = {
    defaultColDef: {
        suppressHeaderMenuButton: true,
        suppressHeaderFilterButton: true,
        suppressHeaderContextMenu: true,
    },
};

const CONTEXT_MENU_PROPS: AgGridProps = {
    suppressContextMenu: true,
};

const ACCESSIBILITY_PROPS: AgGridProps = {
    ensureDomOrder: true,
};

/**
 * @internal
 */
export const AG_GRID_DEFAULT_PROPS: AgGridProps = merge(
    {},
    ROW_GROUPING_PROPS,
    COLUMN_PROPS,
    SIZING_PROPS,
    CELL_SELECTION_PROPS,
    NAVIGATION_PROPS,
    AGGREGATION_PROPS,
    SORTING_PROPS,
    STYLING_PROPS,
    LOADING_PROPS,
    HEADER_PROPS,
    CONTEXT_MENU_PROPS,
    PAGINATION_PROPS,
    ACCESSIBILITY_PROPS,
);
