// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { type ITableDataValue } from "../../interfaces/cells.js";
import { type ITableMeasureGroupValueColumnDefinition } from "../../interfaces/columns.js";
import { type IMappingOptions } from "../../interfaces/mappingOptions.js";
import { type ITableSubtotalRowDefinition } from "../../interfaces/rows.js";
import { type ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapSubtotalRowMeasureGroupValueColumn(
    rowDefinition: ITableSubtotalRowDefinition,
    columnDefinition: ITableMeasureGroupValueColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { config, rawData } = options;
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex } = columnDefinition;

    const measureScope = rowScope.find(
        (s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope",
    );

    if (!measureScope) {
        throw new UnexpectedSdkError("mapSubtotalRowMeasureGroupValueColumn: measure total scope expected");
    }

    const value = rawData?.[rowIndex]?.[0] ?? null;

    const formattedValue = config.valueFormatter(value, measureScope.descriptor.measureHeaderItem.format);

    return {
        type: "value",
        formattedValue,
        value,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
