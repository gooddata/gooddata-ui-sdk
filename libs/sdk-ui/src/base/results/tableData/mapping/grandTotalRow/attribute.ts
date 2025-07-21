// (C) 2019-2025 GoodData Corporation
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableGrandTotalRowDefinition } from "../../interfaces/rows.js";
import { ITableAttributeColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";

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
