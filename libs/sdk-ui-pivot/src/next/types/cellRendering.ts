// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { ICellRendererParams } from "ag-grid-enterprise";

import { AgGridRowData } from "./internal.js";

/**
 * Cell types derived from cell data, used for styling and rendering decisions.
 *
 * @internal
 */
export type CellTypes = {
    isDrillable: boolean;
    isAttribute: boolean;
    isTotal: boolean;
    isSubtotal: boolean;
    isColSubtotal: boolean;
    isColGrandTotal: boolean;
    isOverallTotal: boolean;
    isTotalHeader: boolean;
    isSubtotalHeader: boolean;
    isRowTotal: boolean;
    isRowSubtotal: boolean;
    isNull: boolean;
    isGrouped: boolean;
    isSeparated: boolean;
    isMetric: boolean;
    isFirstOfGroup: boolean;
    isTransposedLeftBorder: boolean;
    isPinnedTop: boolean;
    isPinnedBottom: boolean;
    isPinnedTopLast: boolean;
};

/**
 * Factory function type for creating cell renderers.
 * Used by applyCellRenderingToColDef to create cellRenderer with drillability info.
 *
 * @internal
 */
export type CellRendererFactory = (
    params: ICellRendererParams<AgGridRowData, string | null>,
    cellTypes?: CellTypes,
) => ReactNode;
