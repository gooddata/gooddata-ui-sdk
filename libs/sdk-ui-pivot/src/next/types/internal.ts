// (C) 2025 GoodData Corporation

import { DataViewFacade, ITableColumnDefinition, IVisualizationCallbacks } from "@gooddata/sdk-ui";
import { IPivotTableNextProps } from "./public.js";
import { IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { ITheme } from "@gooddata/sdk-model";

/**
 * Data transformed to a structure used by ag-grid.
 *
 * In case of attribute:
 * - key is attribute local identifier
 * - value is attribute header value
 *
 * In case of measure:
 * - key is measure local identifier
 * - value is measure value
 *
 * In case of pivoting:
 * - key is pivot result field local identifier
 * - value is attribute header value / measure value
 *
 * @internal
 */
export type AgGridRowData = Record<string, string | null>;

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
export interface ICorePivotTableInnerNextProps extends ICorePivotTableNextProps, IInitialExecutionData {}

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
export interface ITableColumnDefinitionByColId {
    [colId: string]: ITableColumnDefinition;
}
