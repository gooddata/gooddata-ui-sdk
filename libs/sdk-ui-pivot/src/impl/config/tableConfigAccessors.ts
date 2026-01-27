// (C) 2007-2026 GoodData Corporation

import { type IExecutionDefinition, type ITotal } from "@gooddata/sdk-model";

import {
    checkIsColumnAutoresizeEnabled,
    checkIsGrowToFitEnabled,
    getColumnHeadersPosition,
    getColumnTotals,
    getColumnWidths,
    getDefaultWidth,
    getDefaultWidthFromProps,
    getExecutionDefinition,
    getGroupRows,
    getMeasureGroupDimension,
    getMenuConfig,
    getRowTotals,
    hasColumnWidths,
    shouldAutoResizeColumns,
} from "./tableConfigUtils.js";
import { type ColumnWidthItem } from "../../columnWidths.js";
import {
    type ColumnHeadersPosition,
    type DefaultColumnWidth,
    type ICorePivotTableProps,
    type IMenu,
    type MeasureGroupDimension,
} from "../../publicTypes.js";
import { type ICorePivotTableState } from "../../tableState.js";

export interface ITableConfigAccessorsContext {
    props: ICorePivotTableProps;
    state: ICorePivotTableState;
}

/**
 * Wrapper class for configuration accessors that delegates to pure utility functions.
 * This class maintains backward compatibility while enabling easier migration to
 * functional components in the future.
 *
 * @internal
 */
export class TableConfigAccessors {
    constructor(private context: ITableConfigAccessorsContext) {}

    // Column totals and row totals
    public getColumnTotals = (): ITotal[] => {
        return getColumnTotals(this.context.state);
    };

    public getRowTotals = (): ITotal[] => {
        return getRowTotals(this.context.state);
    };

    // Execution definition
    public getExecutionDefinition = (): IExecutionDefinition => {
        return getExecutionDefinition(this.context.props);
    };

    // Table configuration
    public getGroupRows = (): boolean => {
        return getGroupRows(this.context.props);
    };

    public getMeasureGroupDimension = (): MeasureGroupDimension => {
        return getMeasureGroupDimension(this.context.props);
    };

    public getColumnHeadersPosition = (): ColumnHeadersPosition => {
        return getColumnHeadersPosition(this.context.props);
    };

    public getMenuConfig = (): IMenu => {
        return getMenuConfig(this.context.props);
    };

    // Column sizing configuration
    public getDefaultWidth = (): number => {
        return getDefaultWidth();
    };

    public isColumnAutoresizeEnabled = (): boolean => {
        return checkIsColumnAutoresizeEnabled(this.context.props);
    };

    public isGrowToFitEnabled = (props: ICorePivotTableProps = this.context.props): boolean => {
        return checkIsGrowToFitEnabled(props);
    };

    public getColumnWidths = (
        props: ICorePivotTableProps = this.context.props,
    ): ColumnWidthItem[] | undefined => {
        return getColumnWidths(props);
    };

    public hasColumnWidths = (): boolean => {
        return hasColumnWidths(this.context.props);
    };

    public getDefaultWidthFromProps = (props: ICorePivotTableProps): DefaultColumnWidth => {
        return getDefaultWidthFromProps(props);
    };

    // Utility methods
    public shouldAutoResizeColumns = (): boolean => {
        return shouldAutoResizeColumns(this.context.props);
    };
}
