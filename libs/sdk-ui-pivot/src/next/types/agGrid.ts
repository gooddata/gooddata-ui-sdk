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
export type AgGridColumn = Column<string | null>;

/**
 * @internal
 */
export type AgGridHeaderParams = IHeaderParams<AgGridRowData, string | null>;

/**
 * @internal
 */
export type AgGridHeaderGroupParams = IHeaderGroupParams<AgGridRowData, string | null>;
