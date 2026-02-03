// (C) 2025-2026 GoodData Corporation

import { type IExecutionResult, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type DataValue,
    type IAttribute,
    type IFilter,
    type IMeasure,
    type ISortItem,
    type ITheme,
    type ITotal,
} from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type ITableColumnDefinition,
    type ITableDataValue,
    type IVisualizationCallbacks,
} from "@gooddata/sdk-ui";

import { type IPivotTableNextProps } from "./public.js";

/**
 * Data transformed to a structure conveniently usable together with ag-grid columnDefs.
 *
 * - `cellDataByColId` is a dictionary of cell data by colId (see `columnDefinitionToColId` for more details, how colId is calculated).
 * - `allRowData` is an array of all values in the row, in the order of the columns (used for drilling, where the value order is required).
 *
 * @internal
 */
export type AgGridRowData = {
    cellDataByColId: { [colId: string]: ITableDataValue };
    allRowData: DataValue[];
};

/**
 * @internal
 */
export type ICorePivotTableNextProps = IPivotTableNextResolvedProps &
    IVisualizationCallbacks & {
        execution: IPreparedExecution;
        theme?: ITheme;
    };

/**
 * @internal
 */
export interface IInitialExecutionData {
    initialExecutionResult: IExecutionResult;
    initialDataView: DataViewFacade;
}

/**
 * @internal
 */
export interface ICorePivotTableInnerNextProps extends ICorePivotTableNextProps, IInitialExecutionData {}

/**
 * @internal
 */
export interface ITableColumnDefinitionByColId {
    [colId: string]: ITableColumnDefinition;
}

/**
 * Resolved public props variant where bucket-like props are already resolved (no placeholders).
 *
 * @internal
 */
export interface IPivotTableNextResolvedProps extends Omit<
    IPivotTableNextProps,
    "rows" | "columns" | "measures" | "filters" | "sortBy" | "totals"
> {
    rows?: IAttribute[];
    columns?: IAttribute[];
    measures?: IMeasure[];
    filters?: IFilter[];
    sortBy?: ISortItem[];
    totals?: ITotal[];
}
