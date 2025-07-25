// (C) 2019-2025 GoodData Corporation
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableSubtotalRowDefinition } from "../../interfaces/rows.js";
import { ITableGrandTotalColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapSubtotalRowGrandTotalColumn(
    rowDefinition: ITableSubtotalRowDefinition,
    columnDefinition: ITableGrandTotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, columnGrandTotalsData } = options;

    const measureScope = columnScope.find(
        (s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope",
    );

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
