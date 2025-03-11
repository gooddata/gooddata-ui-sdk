// (C) 2007-2025 GoodData Corporation

/**
 * This package provides the PivotTable component that you can use to visualize your data in a table-based manner.
 *
 * @remarks
 * The PivotTable component provides additional capabilities such as totals, automatic column resizing, and more.
 *
 * @packageDocumentation
 */
export { PivotTable, pivotTableMenuForCapabilities, getPivotTableDimensions } from "./PivotTable.js";
export { CorePivotTable } from "./CorePivotTable.js";

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
    MeasureGroupDimension,
    ColumnHeadersPosition,
} from "./publicTypes.js";

export {
    IWeakMeasureColumnWidthItem,
    IWeakMeasureColumnWidthItemBody,
    isWeakMeasureColumnWidthItem,
    ColumnWidthItem,
    ColumnWidth,
    IAttributeColumnWidthItem,
    IAttributeColumnWidthItemBody,
    IMeasureColumnWidthItem,
    IMeasureColumnWidthItemBody,
    ISliceMeasureColumnWidthItem,
    ISliceMeasureColumnWidthItemBody,
    IMixedValuesColumnWidthItem,
    IMixedValuesColumnWidthItemBody,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isSliceMeasureColumnWidthItem,
    isMixedValuesColumnWidthItem,
    IAbsoluteColumnWidth,
    IAllMeasureColumnWidthItem,
    IAllMeasureColumnWidthItemBody,
    isAbsoluteColumnWidth,
    isAllMeasureColumnWidthItem,
    IAutoColumnWidth,
    ColumnLocator,
    IAttributeColumnLocator,
    IAttributeColumnLocatorBody,
    ITotalColumnLocator,
    ITotalColumnLocatorBody,
    IMeasureColumnLocator,
    IMeasureColumnLocatorBody,
    isMeasureColumnLocator,
    isAttributeColumnLocator,
    isTotalColumnLocator,
    newAttributeColumnLocator,
    newWidthForAllColumnsForMeasure,
    newWidthForAllMeasureColumns,
    newWidthForAttributeColumn,
    newWidthForSelectedColumns,
    setNewWidthForSelectedColumns,
    newTotalColumnLocator,
} from "./columnWidths.js";
