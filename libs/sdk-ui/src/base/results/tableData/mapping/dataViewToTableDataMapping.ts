// (C) 2019-2025 GoodData Corporation
import { mapGrandTotalRowAttributeColumn } from "./grandTotalRow/attribute.js";
import { mapGrandTotalRowGrandTotalColumn } from "./grandTotalRow/grandTotal.js";
import { mapGrandTotalRowMeasureGroupHeaderColumn } from "./grandTotalRow/measureGroupHeader.js";
import { mapGrandTotalRowMeasureGroupValueColumn } from "./grandTotalRow/measureGroupValue.js";
import { mapGrandTotalRowSubtotalColumn } from "./grandTotalRow/subtotal.js";
import { mapGrandTotalRowValueColumn } from "./grandTotalRow/value.js";
import { mapSubtotalRowAttributeColumn } from "./subtotalRow/attribute.js";
import { mapSubtotalRowGrandTotalColumn } from "./subtotalRow/grandTotal.js";
import { mapSubtotalRowMeasureGroupHeaderColumn } from "./subtotalRow/measureGroupHeader.js";
import { mapSubtotalRowMeasureGroupValueColumn } from "./subtotalRow/measureGroupValue.js";
import { mapSubtotalRowSubtotalColumn } from "./subtotalRow/subtotal.js";
import { mapSubtotalRowValueColumn } from "./subtotalRow/value.js";
import { mapValueRowAttributeColumn } from "./valueRow/attribute.js";
import { mapValueRowGrandTotalColumn } from "./valueRow/grandTotal.js";
import { mapValueRowMeasureGroupHeaderColumn } from "./valueRow/measureGroupHeader.js";
import { mapValueRowMeasureGroupValueColumn } from "./valueRow/measureGroupValue.js";
import { mapValueRowSubtotalColumn } from "./valueRow/subtotal.js";
import { mapValueRowValueColumn } from "./valueRow/value.js";
import { UnexpectedSdkError } from "../../../errors/GoodDataSdkError.js";
import { type ITableDataValue } from "../interfaces/cells.js";
import { type ITableColumnDefinition } from "../interfaces/columns.js";
import { type IMappingOptions } from "../interfaces/mappingOptions.js";
import { type ITableRowDefinition } from "../interfaces/rows.js";

/**
 * @internal
 */
type IDataMapping = {
    [rowType in ITableRowDefinition["type"]]: {
        [columnType in ITableColumnDefinition["type"]]: (
            rowDefinition: ITableRowDefinition,
            columnDefinition: ITableColumnDefinition,
            options: IMappingOptions,
        ) => ITableDataValue;
    };
};

/**
 * @internal
 */
const dataViewToTableDataMapping = {
    value: {
        attribute: mapValueRowAttributeColumn,
        value: mapValueRowValueColumn,
        subtotal: mapValueRowSubtotalColumn,
        grandTotal: mapValueRowGrandTotalColumn,
        measureGroupHeader: mapValueRowMeasureGroupHeaderColumn,
        measureGroupValue: mapValueRowMeasureGroupValueColumn,
    },
    subtotal: {
        attribute: mapSubtotalRowAttributeColumn,
        value: mapSubtotalRowValueColumn,
        subtotal: mapSubtotalRowSubtotalColumn,
        grandTotal: mapSubtotalRowGrandTotalColumn,
        measureGroupHeader: mapSubtotalRowMeasureGroupHeaderColumn,
        measureGroupValue: mapSubtotalRowMeasureGroupValueColumn,
    },
    grandTotal: {
        attribute: mapGrandTotalRowAttributeColumn,
        value: mapGrandTotalRowValueColumn,
        subtotal: mapGrandTotalRowSubtotalColumn,
        grandTotal: mapGrandTotalRowGrandTotalColumn,
        measureGroupHeader: mapGrandTotalRowMeasureGroupHeaderColumn,
        measureGroupValue: mapGrandTotalRowMeasureGroupValueColumn,
    },
} as IDataMapping;

/**
 * @internal
 */
export function mapData(
    rowDefinition: ITableRowDefinition,
    columnDefinition: ITableColumnDefinition,
    options: IMappingOptions,
) {
    const mappingFunction =
        dataViewToTableDataMapping[rowDefinition.type][columnDefinition.type] ?? unknownMapping;

    return mappingFunction(rowDefinition, columnDefinition, options);
}

function unknownMapping(rowDefinition: ITableRowDefinition, columnDefinition: ITableColumnDefinition) {
    throw new UnexpectedSdkError(
        `No mapping found for row type ${rowDefinition.type} and column type ${columnDefinition.type}`,
    );
}
