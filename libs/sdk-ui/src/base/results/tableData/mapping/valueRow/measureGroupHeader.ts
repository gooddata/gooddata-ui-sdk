// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableMeasureGroupHeaderColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableValueRowDefinition } from "../../interfaces/rows.js";
import { ITableDataMeasureScope } from "../../interfaces/scope.js";
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
