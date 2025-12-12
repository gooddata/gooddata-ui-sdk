// (C) 2019-2025 GoodData Corporation
import { type ITableDataValue } from "../../interfaces/cells.js";
import { type ITableAttributeColumnDefinition } from "../../interfaces/columns.js";
import { type IMappingOptions } from "../../interfaces/mappingOptions.js";
import { type ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";

/**
 * @internal
 */
export function mapGrandTotalRowAttributeColumn(
    rowDefinition: ITableGrandTotalRowDefinition,
    columnDefinition: ITableAttributeColumnDefinition,
    _options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, totalType } = rowDefinition;
    const { columnIndex } = columnDefinition;

    return {
        type: "grandTotalHeader",
        formattedValue: totalType,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
