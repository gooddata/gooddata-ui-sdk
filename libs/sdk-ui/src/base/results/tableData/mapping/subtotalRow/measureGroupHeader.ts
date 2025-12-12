// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { type ITableDataValue } from "../../interfaces/cells.js";
import { type ITableMeasureGroupHeaderColumnDefinition } from "../../interfaces/columns.js";
import { type IMappingOptions } from "../../interfaces/mappingOptions.js";
import { type ITableSubtotalRowDefinition } from "../../interfaces/rows.js";
import { type ITableDataMeasureTotalScope } from "../../interfaces/scope.js";

/**
 * @internal
 */
export function mapSubtotalRowMeasureGroupHeaderColumn(
    rowDefinition: ITableSubtotalRowDefinition,
    columnDefinition: ITableMeasureGroupHeaderColumnDefinition,
    _options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex } = columnDefinition;

    const measureTotalScope = rowScope.find(
        (s): s is ITableDataMeasureTotalScope => s.type === "measureTotalScope",
    );

    if (!measureTotalScope) {
        throw new UnexpectedSdkError("mapSubtotalRowMeasureGroupHeaderColumn: measure total scope expected");
    }

    const measure =
        columnDefinition.measureGroupDescriptor.measureGroupHeader.items[
            measureTotalScope.header.totalHeaderItem.measureIndex!
        ];

    const formattedValue = measure.measureHeaderItem.name;

    return {
        type: "totalHeader",
        formattedValue,
        value: measureTotalScope.header,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
