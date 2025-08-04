// (C) 2019-2025 GoodData Corporation
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";
import { ITableMeasureGroupHeaderColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";

/**
 * @internal
 */
export function mapGrandTotalRowMeasureGroupHeaderColumn(
    rowDefinition: ITableGrandTotalRowDefinition,
    columnDefinition: ITableMeasureGroupHeaderColumnDefinition,
    options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, totalType, measureDescriptors } = rowDefinition;
    const { columnIndex } = columnDefinition;
    const { isTransposed } = options;

    const measureDescriptor = measureDescriptors[0];

    if (!measureDescriptor) {
        throw new UnexpectedSdkError("mapGrandTotalRowMeasureGroupHeaderColumn: measure descriptor expected");
    }

    if (isTransposed) {
        const formattedValue = measureDescriptor.measureHeaderItem.name;

        return {
            type: "grandTotalHeader",
            formattedValue,
            rowIndex,
            columnIndex,
            rowDefinition,
            columnDefinition,
        };
    }

    return {
        type: "grandTotalHeader",
        formattedValue: totalType,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
