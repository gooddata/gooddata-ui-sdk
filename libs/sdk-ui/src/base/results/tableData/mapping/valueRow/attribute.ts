// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableAttributeColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableValueRowDefinition } from "../../interfaces/rows.js";
import { getAttributeHeaderValue } from "../getValue/attributeHeader.js";

/**
 * @internal
 */
export function mapValueRowAttributeColumn(
    rowDefinition: ITableValueRowDefinition,
    columnDefinition: ITableAttributeColumnDefinition,
    _options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, rowHeaderIndex } = columnDefinition;

    const attributeScope = rowScope[rowHeaderIndex];

    if (attributeScope.type !== "attributeScope") {
        throw new UnexpectedSdkError("mapValueRowAttributeColumn: attribute scope expected");
    }

    const formattedValue = getAttributeHeaderValue(attributeScope.header);

    return {
        type: "attributeHeader",
        formattedValue,
        value: attributeScope.header,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
