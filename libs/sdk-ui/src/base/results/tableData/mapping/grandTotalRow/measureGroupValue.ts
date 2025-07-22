// (C) 2019-2025 GoodData Corporation
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";
import { ITableMeasureGroupValueColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";

/**
 * @internal
 */
export function mapGrandTotalRowMeasureGroupValueColumn(
    rowDefinition: ITableGrandTotalRowDefinition,
    columnDefinition: ITableMeasureGroupValueColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowGrandTotalIndex } = rowDefinition;
    const { columnIndex } = columnDefinition;
    const { config, rowGrandTotalsData } = options;

    const measureDescriptor = rowDefinition.measureDescriptors[0];

    if (!measureDescriptor) {
        throw new UnexpectedSdkError("mapGrandTotalRowMeasureGroupValueColumn: measure descriptor expected");
    }

    const value = rowGrandTotalsData?.[rowGrandTotalIndex]?.[0] ?? null;

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
