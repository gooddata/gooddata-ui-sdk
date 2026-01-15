// (C) 2025-2026 GoodData Corporation

import {
    type ColDef,
    type ColGroupDef,
    type Column,
    type GridApi,
    type ICellRendererParams,
    type IHeaderGroupParams,
    type IHeaderParams,
} from "ag-grid-enterprise";
import { type AgGridReactProps } from "ag-grid-react";

import { type ITableColumnDefinition } from "@gooddata/sdk-ui";

import { type CellRendererFactory } from "./cellRendering.js";
import { type AgGridRowData } from "./internal.js";

export type AgGridColumnDefContext = {
    columnDefinition: ITableColumnDefinition;
    indexWithinGroup?: number;
    measureIndex?: number;
    /**
     * Factory function to create the cell renderer with cellTypes.
     * This allows applyDrillsToColDef to handle all drillability logic centrally.
     */
    cellRendererFactory?: CellRendererFactory;
};

/**
 * @internal
 */
export type AgGridColumnDef = Omit<ColDef<AgGridRowData, string | null>, "context"> & {
    context: AgGridColumnDefContext;
};

/**
 * @internal
 */
export type AgGridColumnGroupDef = Omit<ColGroupDef<AgGridRowData>, "context"> & {
    context: AgGridColumnDefContext;
};

/**
 * @internal
 */
export type AgGridCellRendererParams = ICellRendererParams<AgGridRowData, string | null>;

/**
 * @internal
 */
export type AgGridApi = GridApi<AgGridRowData>;

/**
 * @internal
 */
export type AgGridProps = AgGridReactProps<AgGridRowData>;

/**
 * @internal
 */
export type AgGridOnColumnResized = NonNullable<AgGridProps["onColumnResized"]>;

/**
 * @internal
 */
export type AgGridOnVirtualColumnsChanged = NonNullable<AgGridProps["onVirtualColumnsChanged"]>;

/**
 * @internal
 */
export type AgGridColumn = Column<string | null>;

/**
 * @internal
 */
export type AgGridHeaderParams = IHeaderParams<AgGridRowData, string | null>;

/**
 * @internal
 */
export type AgGridHeaderGroupParams = IHeaderGroupParams<AgGridRowData, string | null>;

/**
 * @internal
 * Checks if the column definition is a column group definition (raw AG Grid type)
 *
 * @param colDef - The column definition
 * @returns true if the column definition is a column group definition, false otherwise
 */
export function isColGroupDef(colDef: ColDef | ColGroupDef): colDef is ColGroupDef {
    return "children" in colDef && Array.isArray(colDef.children);
}

/**
 * @internal
 * Checks if the column definition is a column group definition (with our custom context)
 *
 * @param colDef - The column definition
 * @returns true if the column definition is a column group definition, false otherwise
 */
export const isAgGridColumnGroupDef = (colDef: unknown): colDef is AgGridColumnGroupDef => {
    return colDef !== undefined && colDef !== null && (colDef as AgGridColumnGroupDef).children !== undefined;
};

/**
 * @internal
 * Checks if the header params are header params (not regular header group params)
 *
 * @param params - The header params to check
 * @returns true if params are header params, false otherwise
 */
export const isAgGridHeaderParams = (params: unknown): params is AgGridHeaderParams => {
    return params !== undefined && params !== null && (params as AgGridHeaderParams).column !== undefined;
};

/**
 * @internal
 * Checks if the header params are header group params (not regular header params)
 *
 * @param params - The header group params to check
 * @returns true if params are header group params, false otherwise
 */
export const isAgGridHeaderGroupParams = (params: unknown): params is AgGridHeaderGroupParams => {
    return (
        params !== undefined &&
        params !== null &&
        (params as AgGridHeaderGroupParams).columnGroup !== undefined
    );
};
