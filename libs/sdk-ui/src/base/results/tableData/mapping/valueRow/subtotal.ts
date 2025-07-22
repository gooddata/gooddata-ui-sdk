// (C) 2019-2025 GoodData Corporation
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableValueRowDefinition } from "../../interfaces/rows.js";
import { ITableSubtotalColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataMeasureScope, ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapValueRowSubtotalColumn(
    rowDefinition: ITableValueRowDefinition,
    columnDefinition: ITableSubtotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, rawData, isTransposed } = options;

    const measureScope = isTransposed
        ? rowScope.find((s): s is ITableDataMeasureScope => s.type === "measureScope")
        : columnScope.find(
              (s): s is ITableDataMeasureTotalScope | ITableDataMeasureScope =>
                  s.type === "measureTotalScope" || s.type === "measureScope",
          );

    if (!measureScope) {
        throw new UnexpectedSdkError(
            "mapValueRowSubtotalColumn: measure scope or measure total scope expected",
        );
    }

    const value = rawData?.[rowIndex]?.[columnHeaderIndex] ?? null;

    const formattedValue = config.valueFormatter(value, measureScope.descriptor.measureHeaderItem.format);

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
