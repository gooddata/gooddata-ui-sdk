// (C) 2025 GoodData Corporation
import { ColDef, ColGroupDef, Column, GridApi, ICellRendererParams } from "ag-grid-enterprise";
import { AgGridReactProps } from "ag-grid-react";
import { ITableColumnDefinition } from "@gooddata/sdk-ui";
import { AgGridRowData } from "./internal.js";

export type AgGridColumnDefContext = {
    columnDefinition: ITableColumnDefinition;
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
export type AgGridColumnGroupDef = ColGroupDef<AgGridRowData>;

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
export type AgGridColumn = Column<string | null>;
