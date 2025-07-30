// (C) 2025 GoodData Corporation
import { ITableColumnDefinition } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual.js";
import isNil from "lodash/isNil.js";
import {
    ColumnWidthItem,
    IAttributeColumnWidthItem,
    IColumnSizing,
    IMeasureColumnWidthItem,
    isAttributeColumnWidthItem,
    isMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
    IWeakMeasureColumnWidthItem,
} from "../../types/sizing.js";
import { columnScopeToColumnLocators } from "../columnDefs/columnScopeToColumnLocators.js";
import { AgGridColumnDef } from "../../types/agGrid.js";

/**
 * @internal
 */
export function applyColumnWidthToColDef(
    colDef: AgGridColumnDef,
    columnWidths: IColumnSizing["columnWidths"] = [],
): AgGridColumnDef {
    const columnDefinition = colDef.context?.columnDefinition as ITableColumnDefinition | undefined;
    if (!columnDefinition) {
        console.error("Column definition is missing in colDef context", { colDef });
        return colDef;
    }

    const columnWidthItem = getColumnWidthForColumnDefinition(columnDefinition, columnWidths);
    const width = columnWidthItem ? getColumnWidthValue(columnWidthItem) : undefined;

    if (!isNil(width)) {
        return {
            ...colDef,
            width,
        };
    }

    return colDef;
}

function getColumnWidthValue(columnWidthItem: ColumnWidthItem): number | undefined {
    if (isAttributeColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.attributeColumnWidthItem.width.value;
    }

    if (isMeasureColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.measureColumnWidthItem.width.value === "auto"
            ? undefined
            : columnWidthItem.measureColumnWidthItem.width.value;
    }

    if (isWeakMeasureColumnWidthItem(columnWidthItem)) {
        return columnWidthItem.measureColumnWidthItem.width.value;
    }

    return undefined;
}

function getColumnWidthForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    columnWidths: IColumnSizing["columnWidths"],
): ColumnWidthItem | undefined {
    if (columnDefinition.type === "attribute") {
        return columnWidths?.find(
            (c): c is IAttributeColumnWidthItem =>
                isAttributeColumnWidthItem(c) &&
                c.attributeColumnWidthItem.attributeIdentifier ===
                    columnDefinition.attributeDescriptor.attributeHeader.localIdentifier,
        );
    }

    if (
        columnDefinition.type === "value" ||
        columnDefinition.type === "subtotal" ||
        columnDefinition.type === "grandTotal"
    ) {
        const locators = columnScopeToColumnLocators(columnDefinition.columnScope);
        const measureLocalIdentifier = getMeasureLocalIdentifier(columnDefinition);

        const targetLocatedWidth = columnWidths?.find((c): c is IMeasureColumnWidthItem => {
            return isMeasureColumnWidthItem(c) && isEqual(c.measureColumnWidthItem.locators, locators);
        });

        const targetWeakWidth = measureLocalIdentifier
            ? columnWidths?.find((c): c is IWeakMeasureColumnWidthItem => {
                  return (
                      isWeakMeasureColumnWidthItem(c) &&
                      c.measureColumnWidthItem.locator.measureLocatorItem.measureIdentifier ===
                          measureLocalIdentifier
                  );
              })
            : undefined;

        return targetWeakWidth ?? targetLocatedWidth;
    }

    return undefined;
}

function getMeasureLocalIdentifier(columnDefinition: ITableColumnDefinition): string | null {
    if (
        columnDefinition.type === "value" ||
        columnDefinition.type === "subtotal" ||
        columnDefinition.type === "grandTotal"
    ) {
        const measureScope = columnDefinition.columnScope.find(
            (s) => s.type === "measureScope" || s.type === "measureTotalScope",
        );
        if (measureScope) {
            return measureScope.descriptor.measureHeaderItem.localIdentifier;
        }
    }

    return null;
}
