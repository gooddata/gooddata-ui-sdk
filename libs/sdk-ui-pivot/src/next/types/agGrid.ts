// (C) 2025 GoodData Corporation

import {
    ColDef,
    ColGroupDef,
    Column,
    GridApi,
    ICellRendererParams,
    IHeaderGroupParams,
    IHeaderParams,
} from "ag-grid-enterprise";
import { AgGridReactProps } from "ag-grid-react";

import { ITableColumnDefinition } from "@gooddata/sdk-ui";

import { AgGridRowData } from "./internal.js";

export type AgGridColumnDefContext = {
    columnDefinition: ITableColumnDefinition;
    indexWithinGroup?: number;
    measureIndex?: number;
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
 * Checks if the column definition is a column group definition
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
