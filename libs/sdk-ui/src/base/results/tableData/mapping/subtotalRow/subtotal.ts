// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableSubtotalColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableSubtotalRowDefinition } from "../../interfaces/rows.js";
import { ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapSubtotalRowSubtotalColumn(
    rowDefinition: ITableSubtotalRowDefinition,
    columnDefinition: ITableSubtotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, rawData, isTransposed } = options;

    const measureTotalScope = isTransposed
        ? rowScope.find((s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope")
        : columnScope.find((s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope");

    if (!measureTotalScope) {
        throw new UnexpectedSdkError("mapSubtotalRowSubtotalColumn: measure total scope expected");
    }

    const value = rawData?.[rowIndex]?.[columnHeaderIndex] ?? null;

    const formattedValue = config.valueFormatter(
        value,
        measureTotalScope.descriptor.measureHeaderItem.format,
    );

    return {
        type: "subtotalValue",
        formattedValue,
        value,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
