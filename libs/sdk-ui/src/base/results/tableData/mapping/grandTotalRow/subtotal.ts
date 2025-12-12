// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { type ITableDataValue } from "../../interfaces/cells.js";
import { type ITableSubtotalColumnDefinition } from "../../interfaces/columns.js";
import { type IMappingOptions } from "../../interfaces/mappingOptions.js";
import { type ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";
import { type ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapGrandTotalRowSubtotalColumn(
    rowDefinition: ITableGrandTotalRowDefinition,
    columnDefinition: ITableSubtotalColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowGrandTotalIndex, measureDescriptors } = rowDefinition;
    const { columnIndex, columnHeaderIndex, columnScope } = columnDefinition;
    const { config, rowGrandTotalsData, isTransposed } = options;

    if (isTransposed) {
        const measureDescriptor = measureDescriptors[0];

        if (!measureDescriptor) {
            throw new UnexpectedSdkError("mapGrandTotalRowSubtotalColumn: measure descriptor expected");
        }

        const value = rowGrandTotalsData?.[rowGrandTotalIndex]?.[columnHeaderIndex] ?? null;

        const formattedValue = config.valueFormatter(value, measureDescriptor.measureHeaderItem.format);

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
    const measureScope = columnScope.find(
        (s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope",
    );

    if (!measureScope) {
        throw new UnexpectedSdkError("mapGrandTotalRowSubtotalColumn: measure total scope expected");
    }

    const value = rowGrandTotalsData?.[rowGrandTotalIndex]?.[columnHeaderIndex] ?? null;

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
