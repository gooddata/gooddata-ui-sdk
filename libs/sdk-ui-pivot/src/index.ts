// (C) 2007-2021 GoodData Corporation
/**
 * This package provides the PivotTable component that you can use to visualize your data in a table-based manner.
 *
 * @remarks
 * The PivotTable component provides additional capabilities such as totals, automatic column resizing, and more.
 *
 * @packageDocumentation
 */
export { PivotTable, pivotTableMenuForCapabilities } from "./PivotTable";
export { CorePivotTable } from "./CorePivotTable";

export {
    IPivotTableBucketProps,
    IPivotTableBaseProps,
    IPivotTableProps,
    IPivotTableConfig,
    IColumnSizing,
    DefaultColumnWidth,
    ICorePivotTableProps,
    ColumnResizedCallback,
    IMenu,
} from "./publicTypes";

export {
    IWeakMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
    ColumnWidthItem,
    ColumnWidth,
    IAttributeColumnWidthItem,
    IMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    IAbsoluteColumnWidth,
    IAllMeasureColumnWidthItem,
    isAbsoluteColumnWidth,
    isAllMeasureColumnWidthItem,
    IAutoColumnWidth,
    ColumnLocator,
    IAttributeColumnLocator,
    IMeasureColumnLocator,
    isMeasureColumnLocator,
    isAttributeColumnLocator,
    newAttributeColumnLocator,
    newWidthForAllColumnsForMeasure,
    newWidthForAllMeasureColumns,
    newWidthForAttributeColumn,
    newWidthForSelectedColumns,
} from "./columnWidths";
