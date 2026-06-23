// (C) 2025-2026 GoodData Corporation

import { type SuppressHeaderKeyboardEventParams, type SuppressKeyboardEventParams } from "ag-grid-enterprise";
import { merge } from "lodash-es";

import { LoadingComponent } from "@gooddata/sdk-ui";

import { HEADER_CELL_CLASSNAME } from "../features/styling/bem.js";
import { type AgGridProps } from "../types/agGrid.js";
import { type AgGridRowData } from "../types/internal.js";

/**
 * AG Grid's suppressKeyboardEvent lets us control which keyboard events AG Grid processes
 * vs which ones should bubble up to the browser.
 *
 * Returning true = suppress AG Grid's handling, let our custom handler process it.
 * Returning false = let AG Grid handle the event.
 *
 * This is a column-level (ColDef) property, so it lives on defaultColDef. It is a static
 * function kept on the stable default props on purpose: deriving it inside a hook would
 * change the defaultColDef reference whenever the hook re-runs, making AG Grid re-apply
 * column defaults and discard the growToFit column sizing applied on the initial render.
 */
function suppressKeyboardEvent(params: SuppressKeyboardEventParams<AgGridRowData, string | null>): boolean {
    const { event } = params;
    const { key } = event;

    // Prevent Space key from scrolling the page. Space itself is custom-handled in
    // onCellKeyDown (drilling, Ctrl+Space/Shift+Space selection), so suppress AG Grid's default.
    if (key === " " || key === "Space") {
        event.preventDefault();
        return true;
    }

    // Suppress Tab - handled in onCellKeyDown (useInteractionProps.ts)
    if (key === "Tab") {
        return true;
    }

    // Suppress custom navigation keys - handled in onCellKeyDown (useInteractionProps.ts):
    // - Home/End (custom row navigation)
    // - Ctrl+Home/End (jump to first/last cell in grid)
    if (key === "Home" || key === "End") {
        return true;
    }

    // Let AG Grid handle everything else. This covers its standard cell navigation (arrows,
    // Page Up/Down) as well as its built-in clipboard shortcuts (Ctrl/Cmd+C copy via
    // processCellForClipboard, Ctrl/Cmd+A select all). Returning a blanket true here would
    // suppress those clipboard shortcuts and break copy (LX-2606).
    return false;
}

function suppressHeaderKeyboardEvent(
    params: SuppressHeaderKeyboardEventParams<AgGridRowData, string | null>,
): boolean {
    const { event } = params;
    const { key } = event;

    // Prevent Space key from scrolling the page
    // The actual Space key handling for actions is done in header components via useEffect
    if (key === " " || key === "Space") {
        event.preventDefault();
    }

    // Let AG Grid handle all events normally
    return false;
}

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
    defaultColDef: {
        suppressKeyboardEvent,
        suppressHeaderKeyboardEvent,
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
    suppressNoRowsOverlay: true,
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
