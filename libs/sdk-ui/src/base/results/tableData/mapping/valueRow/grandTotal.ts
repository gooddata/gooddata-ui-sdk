// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableGrandTotalColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableValueRowDefinition } from "../../interfaces/rows.js";
import { ITableDataMeasureScope, ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapValueRowGrandTotalColumn(
    rowDefinition: ITableValueRowDefinition,
    columnDefinition: ITableGrandTotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, columnGrandTotalsData, isTransposed } = options;

    const measureScope = isTransposed
        ? rowScope.find((s): s is ITableDataMeasureScope => s.type === "measureScope")
        : columnScope.find((s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope");

    if (!measureScope) {
        throw new UnexpectedSdkError(
            "mapValueRowGrandTotalColumn: measure scope or measure total scope expected",
        );
    }

    const value = columnGrandTotalsData?.[rowIndex]?.[columnHeaderIndex] ?? null;

    const formattedValue = config.valueFormatter(value, measureScope.descriptor.measureHeaderItem.format);

    return {
        type: "grandTotalValue",
        formattedValue,
        value,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
