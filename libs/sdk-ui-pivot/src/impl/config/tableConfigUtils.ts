// (C) 2007-2025 GoodData Corporation
import { type IExecutionDefinition, type ITotal } from "@gooddata/sdk-model";

import { type ColumnWidthItem } from "../../columnWidths.js";
import {
    type ColumnHeadersPosition,
    type DefaultColumnWidth,
    type ICorePivotTableProps,
    type IMenu,
    type MeasureGroupDimension,
} from "../../publicTypes.js";
import { type ICorePivotTableState } from "../../tableState.js";
import { isColumnAutoresizeEnabled } from "../resizing/columnSizing.js";

const DEFAULT_COLUMN_WIDTH = 200;

/**
 * Pure utility functions for accessing table configuration.
 * These functions are designed to be easily convertible to hooks when the component
 * is refactored to a functional component.
 *
 * @internal
 */

// Column totals and row totals
export const getColumnTotals = (state: ICorePivotTableState): ITotal[] => {
    return state.columnTotals;
};

export const getRowTotals = (state: ICorePivotTableState): ITotal[] => {
    return state.rowTotals;
};

// Execution definition
export const getExecutionDefinition = (props: ICorePivotTableProps): IExecutionDefinition => {
    return props.execution.definition;
};

// Table configuration
export const getGroupRows = (props: ICorePivotTableProps): boolean => {
    return props.config?.groupRows ?? true;
};

export const getMeasureGroupDimension = (props: ICorePivotTableProps): MeasureGroupDimension => {
    return props.config?.measureGroupDimension ?? "columns";
};

export const getColumnHeadersPosition = (props: ICorePivotTableProps): ColumnHeadersPosition => {
    return props.config?.columnHeadersPosition ?? "top";
};

export const getMenuConfig = (props: ICorePivotTableProps): IMenu => {
    return props.config?.menu ?? {};
};

// Column sizing configuration
export const getDefaultWidth = (): number => {
    return DEFAULT_COLUMN_WIDTH;
};

export const getDefaultWidthFromProps = (props: ICorePivotTableProps): DefaultColumnWidth => {
    return props.config?.columnSizing?.defaultWidth ?? "unset";
};

export const checkIsColumnAutoresizeEnabled = (props: ICorePivotTableProps): boolean => {
    const defaultWidth = getDefaultWidthFromProps(props);
    return isColumnAutoresizeEnabled(defaultWidth);
};

export const checkIsGrowToFitEnabled = (props: ICorePivotTableProps): boolean => {
    return props.config?.columnSizing?.growToFit === true;
};

export const getColumnWidths = (props: ICorePivotTableProps): ColumnWidthItem[] | undefined => {
    return props.config?.columnSizing?.columnWidths;
};

export const hasColumnWidths = (props: ICorePivotTableProps): boolean => {
    return !!getColumnWidths(props);
};

// Utility methods
export const shouldAutoResizeColumns = (props: ICorePivotTableProps): boolean => {
    const columnAutoresize = checkIsColumnAutoresizeEnabled(props);
    const growToFit = checkIsGrowToFitEnabled(props);
    return columnAutoresize || growToFit;
};
