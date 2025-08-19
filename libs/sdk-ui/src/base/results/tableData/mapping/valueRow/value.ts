// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableValueColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableValueRowDefinition } from "../../interfaces/rows.js";
import { ITableDataMeasureScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapValueRowValueColumn(
    rowDefinition: ITableValueRowDefinition,
    columnDefinition: ITableValueColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, rawData, isTransposed, hasMeasures } = options;

    const measureScope = isTransposed
        ? rowScope.find((s): s is ITableDataMeasureScope => s.type === "measureScope")
        : columnScope.find((s): s is ITableDataMeasureScope => s.type === "measureScope");

    if (!hasMeasures) {
        return {
            type: "value",
            formattedValue: null,
            value: null,
            rowIndex,
            columnIndex,
            rowDefinition,
            columnDefinition,
        };
    }

    if (!measureScope) {
        throw new UnexpectedSdkError("mapValueRowValueColumn: measure scope expected");
    }

    const value = rawData?.[rowIndex]?.[columnHeaderIndex] ?? null;

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
