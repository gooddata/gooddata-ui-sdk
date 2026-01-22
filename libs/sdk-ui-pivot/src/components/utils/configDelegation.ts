// (C) 2007-2026 GoodData Corporation

import { type TableConfigAccessors } from "../../impl/config/tableConfigAccessors.js";
import { type ICorePivotTableProps } from "../../publicTypes.js";

/**
 * Creates configuration accessor delegates that forward calls to the TableConfigAccessors instance.
 * This helps reduce boilerplate in the main component and makes it easier to convert to hooks later.
 */
export function createConfigDelegates(configAccessors: TableConfigAccessors) {
    return {
        getColumnTotals: () => configAccessors.getColumnTotals(),
        getRowTotals: () => configAccessors.getRowTotals(),
        getExecutionDefinition: () => configAccessors.getExecutionDefinition(),
        getGroupRows: () => configAccessors.getGroupRows(),
        getMeasureGroupDimension: () => configAccessors.getMeasureGroupDimension(),
        getColumnHeadersPosition: () => configAccessors.getColumnHeadersPosition(),
        getMenuConfig: () => configAccessors.getMenuConfig(),
        getDefaultWidth: () => configAccessors.getDefaultWidth(),
        isColumnAutoresizeEnabled: () => configAccessors.isColumnAutoresizeEnabled(),
        isGrowToFitEnabled: (props?: ICorePivotTableProps) => configAccessors.isGrowToFitEnabled(props),
        getColumnWidths: (props: ICorePivotTableProps) => configAccessors.getColumnWidths(props),
        hasColumnWidths: () => configAccessors.hasColumnWidths(),
        getDefaultWidthFromProps: (props: ICorePivotTableProps) =>
            configAccessors.getDefaultWidthFromProps(props),
        shouldAutoResizeColumns: () => configAccessors.shouldAutoResizeColumns(),
    };
}

export type ConfigDelegates = ReturnType<typeof createConfigDelegates>;
