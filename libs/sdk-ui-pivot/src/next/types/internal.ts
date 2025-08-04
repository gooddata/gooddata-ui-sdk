// (C) 2025 GoodData Corporation

import {
    DataViewFacade,
    ITableColumnDefinition,
    ITableDataValue,
    IVisualizationCallbacks,
} from "@gooddata/sdk-ui";
import { IPivotTableNextProps } from "./public.js";
import { IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { ITheme, DataValue } from "@gooddata/sdk-model";

/**
 * Data transformed to a structure conveniently usable together with ag-grid columnDefs.
 *
 * - `cellDataByColId` is a dictionary of cell data by colId (see `columnDefinitionToColId` for more details, how colId is calculated).
 * - `allRowData` is an array of all values in the row, in the order of the columns (used for drilling, where the value order is required).
 *
 * @internal
 */
export interface AgGridRowData {
    cellDataByColId: { [colId: string]: ITableDataValue };
    allRowData: DataValue[];
}

/**
 * @internal
 */
export interface ICorePivotTableNextProps extends IPivotTableNextProps, IVisualizationCallbacks {
    execution: IPreparedExecution;
    theme?: ITheme;
}

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
