// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableValueColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";
import { ITableDataMeasureScope, ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapGrandTotalRowValueColumn(
    rowDefinition: ITableGrandTotalRowDefinition,
    columnDefinition: ITableValueColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowGrandTotalIndex, measureDescriptors } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, rowGrandTotalsData, isTransposed } = options;

    if (isTransposed) {
        const measureDescriptor = measureDescriptors[0];

        if (!measureDescriptor) {
            throw new UnexpectedSdkError("mapGrandTotalRowValueColumn: measure descriptor expected");
        }

        const value = rowGrandTotalsData?.[rowGrandTotalIndex]?.[columnHeaderIndex] ?? null;

        const formattedValue = config.valueFormatter(value, measureDescriptor.measureHeaderItem.format);

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

    const measureScope = columnScope.find(
        (s): s is ITableDataMeasureTotalScope | ITableDataMeasureScope =>
            s.type === "measureTotalScope" || s.type === "measureScope",
    );

    if (!measureScope) {
        throw new UnexpectedSdkError("mapGrandTotalRowValueColumn: measure scope expected");
    }

    const value = rowGrandTotalsData?.[rowGrandTotalIndex]?.[columnHeaderIndex] ?? null;

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
