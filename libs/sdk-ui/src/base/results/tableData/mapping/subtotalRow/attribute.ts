// (C) 2019-2025 GoodData Corporation
import { UnexpectedSdkError } from "../../../../errors/GoodDataSdkError.js";
import { ITableDataValue } from "../../interfaces/cells.js";
import { ITableAttributeColumnDefinition } from "../../interfaces/columns.js";
import { IMappingOptions } from "../../interfaces/mappingOptions.js";
import { ITableSubtotalRowDefinition } from "../../interfaces/rows.js";
import { getAttributeHeaderValue } from "../getValue/attributeHeader.js";
import { getTotalHeaderValue } from "../getValue/totalHeader.js";

/**
 * @internal
 */
export function mapSubtotalRowAttributeColumn(
    rowDefinition: ITableSubtotalRowDefinition,
    columnDefinition: ITableAttributeColumnDefinition,
    _options: IMappingOptions,
): ITableDataValue {
    const { rowIndex, rowScope } = rowDefinition;
    const { columnIndex, rowHeaderIndex } = columnDefinition;

    const attributeScope = rowScope[rowHeaderIndex];

    if (attributeScope.type !== "attributeScope" && attributeScope.type !== "attributeTotalScope") {
        throw new UnexpectedSdkError(
            "mapSubtotalRowAttributeColumn: attribute scope or attribute total scope expected",
        );
    }

    if (attributeScope.type === "attributeScope") {
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

    const formattedValue = getTotalHeaderValue(attributeScope.header);

    return {
        type: "totalHeader",
        formattedValue,
        value: attributeScope.header,
        rowIndex,
        columnIndex,
        rowDefinition,
        columnDefinition,
    };
}
