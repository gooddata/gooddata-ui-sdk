// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableGrandTotalColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";
import { ITableDataMeasureScope, ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapGrandTotalRowGrandTotalColumn(
    rowDefinition: ITableGrandTotalRowDefinition,
    columnDefinition: ITableGrandTotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowGrandTotalIndex, measureDescriptors } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, overallTotalsData, isTransposed } = options;

    const measureScope = columnScope.find(
        (s): s is ITableDataMeasureScope | ITableDataMeasureTotalScope =>
            s.type === "measureTotalScope" || s.type === "measureScope",
    );

    const measureDescriptor = isTransposed ? measureDescriptors[0] : measureScope?.descriptor;

    if (!measureDescriptor) {
        throw new UnexpectedSdkError("mapGrandTotalRowGrandTotalColumn: measure descriptor expected");
    }

    const value = overallTotalsData?.[0]?.[rowGrandTotalIndex]?.[columnHeaderIndex] ?? null;

    const formattedValue = config.valueFormatter(value, measureDescriptor.measureHeaderItem.format);

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
