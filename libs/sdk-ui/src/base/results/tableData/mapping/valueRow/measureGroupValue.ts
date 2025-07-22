// (C) 2019-2025 GoodData Corporation
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableValueRowDefinition } from "../../interfaces/rows.js";
import { ITableMeasureGroupValueColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataMeasureScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapValueRowMeasureGroupValueColumn(
    rowDefinition: ITableValueRowDefinition,
    columnDefinition: ITableMeasureGroupValueColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex } = columnDefinition;
    const { config, rawData } = options;

    const measureScope = rowScope.find((s): s is ITableDataMeasureScope => s.type === "measureScope");

    if (!measureScope) {
        throw new UnexpectedSdkError("mapValueRowMeasureGroupValueColumn: measure scope expected");
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
