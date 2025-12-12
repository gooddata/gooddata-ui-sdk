// (C) 2007-2025 GoodData Corporation
import { type IExecutionDefinition, type ITotal } from "@gooddata/sdk-model";

import * as configUtils from "./tableConfigUtils.js";
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
        return configUtils.getColumnTotals(this.context.state);
    };

    public getRowTotals = (): ITotal[] => {
        return configUtils.getRowTotals(this.context.state);
    };

    // Execution definition
    public getExecutionDefinition = (): IExecutionDefinition => {
        return configUtils.getExecutionDefinition(this.context.props);
    };

    // Table configuration
    public getGroupRows = (): boolean => {
        return configUtils.getGroupRows(this.context.props);
    };

    public getMeasureGroupDimension = (): MeasureGroupDimension => {
        return configUtils.getMeasureGroupDimension(this.context.props);
    };

    public getColumnHeadersPosition = (): ColumnHeadersPosition => {
        return configUtils.getColumnHeadersPosition(this.context.props);
    };

    public getMenuConfig = (): IMenu => {
        return configUtils.getMenuConfig(this.context.props);
    };

    // Column sizing configuration
    public getDefaultWidth = (): number => {
        return configUtils.getDefaultWidth();
    };

    public isColumnAutoresizeEnabled = (): boolean => {
        return configUtils.checkIsColumnAutoresizeEnabled(this.context.props);
    };

    public isGrowToFitEnabled = (props: ICorePivotTableProps = this.context.props): boolean => {
        return configUtils.checkIsGrowToFitEnabled(props);
    };

    public getColumnWidths = (
        props: ICorePivotTableProps = this.context.props,
    ): ColumnWidthItem[] | undefined => {
        return configUtils.getColumnWidths(props);
    };

    public hasColumnWidths = (): boolean => {
        return configUtils.hasColumnWidths(this.context.props);
    };

    public getDefaultWidthFromProps = (props: ICorePivotTableProps): DefaultColumnWidth => {
        return configUtils.getDefaultWidthFromProps(props);
    };

    // Utility methods
    public shouldAutoResizeColumns = (): boolean => {
        return configUtils.shouldAutoResizeColumns(this.context.props);
    };
}
