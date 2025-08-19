// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableMeasureGroupHeaderColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";

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
