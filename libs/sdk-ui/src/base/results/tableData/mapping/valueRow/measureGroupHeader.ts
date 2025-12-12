// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { type ITableDataValue } from "../../interfaces/cells.js";
import { type ITableMeasureGroupHeaderColumnDefinition } from "../../interfaces/columns.js";
import { type IMappingOptions } from "../../interfaces/mappingOptions.js";
import { type ITableValueRowDefinition } from "../../interfaces/rows.js";
import { type ITableDataMeasureScope } from "../../interfaces/scope.js";
import { getMeasureHeaderValue } from "../getValue/measureHeader.js";

/**
 * @internal
 */
export function mapValueRowMeasureGroupHeaderColumn(
    rowDefinition: ITableValueRowDefinition,
    columnDefinition: ITableMeasureGroupHeaderColumnDefinition,
    _options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex } = columnDefinition;

    const measureScope = rowScope.find((s): s is ITableDataMeasureScope => s.type === "measureScope");

    if (!measureScope) {
        throw new UnexpectedSdkError("mapValueRowMeasureGroupHeaderColumn: measure scope expected");
    }

    const formattedValue = getMeasureHeaderValue(measureScope.header);

    return {
        type: "measureHeader",
        formattedValue,
        value: measureScope.header,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
