// (C) 2019-2025 GoodData Corporation
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";
import { ITableGrandTotalColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataMeasureScope, ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapGrandTotalRowGrandTotalColumn(
    rowDefinition: ITableGrandTotalRowDefinition,
    columnDefinition: ITableGrandTotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowGrandTotalIndex } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, overallTotalsData } = options;

    const measureScope = columnScope.find(
        (s): s is ITableDataMeasureScope | ITableDataMeasureTotalScope =>
            s.type === "measureTotalScope" || s.type === "measureScope",
    );

    if (!measureScope) {
        throw new UnexpectedSdkError("mapGrandTotalRowGrandTotalColumn: measure scope expected");
    }

    const value = overallTotalsData?.[0]?.[rowGrandTotalIndex]?.[columnHeaderIndex] ?? null;

    const formattedValue = config.valueFormatter(value, measureScope.descriptor.measureHeaderItem.format);

    return {
        type: "overallTotalValue",
        formattedValue,
        value,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
