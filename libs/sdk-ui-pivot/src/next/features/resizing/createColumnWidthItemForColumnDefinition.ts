// (C) 2025 GoodData Corporation

import { assertNever } from "@gooddata/sdk-model";
import { ITableColumnDefinition, UnexpectedSdkError } from "@gooddata/sdk-ui";

import {
    newAttributeColumnLocator,
    newMeasureColumnLocator,
    newTotalColumnLocator,
} from "../../types/locators.js";
import {
    ColumnWidthItem,
    IMixedValuesColumnWidthItem,
    ISliceMeasureColumnWidthItem,
    IWeakMeasureColumnWidthItem,
    newWidthForAttributeColumn,
    setNewWidthForSelectedColumns,
} from "../../types/resizing.js";

/**
 * Creates {@link ColumnWidthItem} with specified width for the provided {@link ITableColumnDefinition}.
 *
 * @internal
 */
export function createColumnWidthItemForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    columnWidth: number,
): ColumnWidthItem {
    switch (columnDefinition.type) {
        case "attribute":
            return newWidthForAttributeColumn(
                columnDefinition.attributeDescriptor.attributeHeader.localIdentifier,
                columnWidth,
            );
        case "value":
        case "subtotal":
        case "grandTotal": {
            const measureScopes = columnDefinition.columnScope.filter(
                (s) => s.type === "measureScope" || s.type === "measureTotalScope",
            );
            const attributeAndTotalScopes = columnDefinition.columnScope.filter(
                (s) => s.type === "attributeScope" || s.type === "attributeTotalScope",
            );
            const measureIds = measureScopes.map((s) => s.descriptor.measureHeaderItem.localIdentifier);
            const attributeAndTotalLocators = attributeAndTotalScopes.map((s) => {
                if (s.type === "attributeScope") {
                    return newAttributeColumnLocator(
                        s.descriptor.attributeHeader.localIdentifier,
                        s.header.attributeHeaderItem.uri ?? undefined,
                    );
                }

                return newTotalColumnLocator(
                    s.descriptor.attributeHeader.localIdentifier,
                    s.header.totalHeaderItem.type,
                );
            });
            return setNewWidthForSelectedColumns(measureIds, attributeAndTotalLocators, columnWidth);
        }
        case "measureGroupHeader": {
            const measureIds = columnDefinition.measureGroupDescriptor.measureGroupHeader.items.map(
                (item) => item.measureHeaderItem.localIdentifier,
            );
            const sliceWidthItem: ISliceMeasureColumnWidthItem = {
                sliceMeasureColumnWidthItem: {
                    width: {
                        value: columnWidth,
                    },
                    locators: measureIds.map((localId) => newMeasureColumnLocator(localId)),
                },
            };

            return sliceWidthItem;
        }
        case "measureGroupValue": {
            const measureIds = columnDefinition.measureGroupDescriptor.measureGroupHeader.items.map(
                (item) => item.measureHeaderItem.localIdentifier,
            );
            const mixedValuesWidthItem: IMixedValuesColumnWidthItem = {
                mixedValuesColumnWidthItem: {
                    locators: measureIds.map((localId) => newMeasureColumnLocator(localId)),
                    width: {
                        value: columnWidth,
                    },
                },
            };

            return mixedValuesWidthItem;
        }
        default: {
            assertNever(columnDefinition);
            throw new UnexpectedSdkError(`Unknown column definition: ${JSON.stringify(columnDefinition)}`);
        }
    }
}

/**
 * Creates {@link IWeakMeasureColumnWidthItem} for the provided {@link ITableColumnDefinition},
 * but only in case it is possible to do so (if there is a measure in the column scope),
 * otherwise returns undefined.
 *
 * @internal
 */
export function createWeakColumnWidthItemForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    columnWidth: number,
): IWeakMeasureColumnWidthItem | undefined {
    const measureLocalIdentifier = getMeasureFromColumnDefinition(columnDefinition);
    return measureLocalIdentifier
        ? {
              measureColumnWidthItem: {
                  width: { value: columnWidth },
                  locator: newMeasureColumnLocator(measureLocalIdentifier),
              },
          }
        : undefined;
}

function getMeasureFromColumnDefinition(columnDefinition: ITableColumnDefinition): string | undefined {
    if (
        columnDefinition.type === "subtotal" ||
        columnDefinition.type === "value" ||
        columnDefinition.type === "grandTotal"
    ) {
        return columnDefinition.columnScope.find(
            (s) => s.type === "measureScope" || s.type === "measureTotalScope",
        )?.descriptor.measureHeaderItem.localIdentifier;
    }
    return undefined;
}
