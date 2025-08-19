// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableValueColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableSubtotalRowDefinition } from "../../interfaces/rows.js";
import { ITableDataMeasureScope, ITableDataMeasureTotalScope } from "../../interfaces/scope.js";
import { getTotalHeaderValue } from "../getValue/totalHeader.js";

/**
 * @internal
 */
export function mapSubtotalRowValueColumn(
    rowDefinition: ITableSubtotalRowDefinition,
    columnDefinition: ITableValueColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, rawData, isTransposed } = options;

    const measureScope = isTransposed
        ? rowScope.find((s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope")
        : columnScope.find(
              (s): s is ITableDataMeasureTotalScope | ITableDataMeasureScope =>
                  s.type === "measureTotalScope" || s.type === "measureScope",
          );

    if (!measureScope) {
        throw new UnexpectedSdkError(
            "mapSubtotalRowValueColumn: measure scope or measure total scope expected",
        );
    }

    if (!isTransposed && measureScope.type === "measureTotalScope") {
        const formattedValue = getTotalHeaderValue(measureScope.header);
        return {
            type: "totalHeader",
            formattedValue,
            value: measureScope.header,
            rowIndex,
            columnIndex,
            rowDefinition,
            columnDefinition,
        };
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
