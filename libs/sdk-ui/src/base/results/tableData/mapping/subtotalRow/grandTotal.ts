// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { type ITableDataValue } from "../../interfaces/cells.js";
import { type ITableGrandTotalColumnDefinition } from "../../interfaces/columns.js";
import { type IMappingOptions } from "../../interfaces/mappingOptions.js";
import { type ITableSubtotalRowDefinition } from "../../interfaces/rows.js";
import { type ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapSubtotalRowGrandTotalColumn(
    rowDefinition: ITableSubtotalRowDefinition,
    columnDefinition: ITableGrandTotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, columnGrandTotalsData, isTransposed } = options;

    const measureScope = isTransposed
        ? rowScope.find((s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope")
        : columnScope.find((s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope");

    if (!measureScope) {
        throw new UnexpectedSdkError("mapSubtotalRowGrandTotalColumn: measure total scope expected");
    }

    const value = columnGrandTotalsData?.[rowIndex]?.[columnHeaderIndex] ?? null;

    const formattedValue = config.valueFormatter(value, measureScope.descriptor.measureHeaderItem.format);

    return {
        type: "grandTotalSubtotalValue",
        formattedValue,
        value,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
