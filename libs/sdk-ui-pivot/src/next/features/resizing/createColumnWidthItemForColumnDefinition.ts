// (C) 2025 GoodData Corporation
import { ITableColumnDefinition, UnexpectedSdkError } from "@gooddata/sdk-ui";
import {
    ColumnWidthItem,
    IMixedValuesColumnWidthItem,
    ISliceMeasureColumnWidthItem,
    newAttributeColumnLocator,
    newMeasureColumnLocator,
    newTotalColumnLocator,
    newWidthForAttributeColumn,
    setNewWidthForSelectedColumns,
} from "../../types/resizing.js";
import { assertNever } from "@gooddata/sdk-model";

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
                        s.header.attributeHeaderItem.name ?? undefined,
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
