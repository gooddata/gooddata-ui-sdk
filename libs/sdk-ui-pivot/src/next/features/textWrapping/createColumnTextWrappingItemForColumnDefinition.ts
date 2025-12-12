// (C) 2025 GoodData Corporation

import { assertNever } from "@gooddata/sdk-model";
import { type ITableColumnDefinition, UnexpectedSdkError } from "@gooddata/sdk-ui";

import {
    newAttributeColumnLocator,
    newMeasureColumnLocator,
    newTotalColumnLocator,
} from "../../types/locators.js";
import { type IColumnTextWrappingItem } from "../../types/textWrapping.js";

/**
 * Creates {@link IColumnTextWrappingItem} with specified text wrapping settings for the provided {@link ITableColumnDefinition}.
 *
 * @remarks
 * For pivot table columns with attribute scopes, this can optionally create a pivot group locator
 * instead of individual column locators. Set `usePivotGroupLocator` to true to target the entire
 * pivot group hierarchy rather than a specific leaf column.
 *
 * @param columnDefinition - The column definition to create a text wrapping item for
 * @param settings - Text wrapping settings (wrapText, wrapHeaderText)
 * @param options - Optional configuration with following fields:
 * options.usePivotGroupLocator - If true, creates a pivot group locator for columns with attribute scopes
 * options.pivotGroupDepth - The depth of the pivot group (0 = topmost). Used to create locators specific to that depth level.
 * options.includeElements - If false, creates locator without element values (matches any element at that attribute level)
 *
 * @internal
 */
export function createColumnTextWrappingItemForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    settings: { wrapText?: boolean; wrapHeaderText?: boolean },
    options?: { usePivotGroupLocator?: boolean; pivotGroupDepth?: number; includeElements?: boolean },
): IColumnTextWrappingItem {
    const { wrapText, wrapHeaderText } = settings;

    switch (columnDefinition.type) {
        case "attribute": {
            return {
                locators: [
                    newAttributeColumnLocator(
                        columnDefinition.attributeDescriptor.attributeHeader.localIdentifier,
                    ),
                ],
                wrapText,
                wrapHeaderText,
            };
        }
        case "value":
        case "subtotal":
        case "grandTotal": {
            const measureScopes = columnDefinition.columnScope.filter(
                (s) => s.type === "measureScope" || s.type === "measureTotalScope",
            );
            const attributeAndTotalScopes = columnDefinition.columnScope.filter(
                (s) => s.type === "attributeScope" || s.type === "attributeTotalScope",
            );

            // If usePivotGroupLocator is true and we have attribute scopes, create group locators
            if (options?.usePivotGroupLocator && attributeAndTotalScopes.length > 0) {
                // Use pivotGroupDepth to determine which attributes belong to THIS pivot group level
                // pivotGroupDepth=0 means topmost level (first attribute), depth=1 means second level, etc.
                const depth = options.pivotGroupDepth ?? attributeAndTotalScopes.length - 1;
                const scopesForThisLevel = attributeAndTotalScopes.slice(0, depth + 1);

                // Only include element values if explicitly requested (default is true for backward compatibility)
                const includeElements = options.includeElements !== false;

                // Create attribute locators for each level in the group
                const locators = scopesForThisLevel.map((s) => {
                    const attributeId = s.descriptor.attributeHeader.localIdentifier;
                    const element = includeElements
                        ? s.type === "attributeScope"
                            ? (s.header.attributeHeaderItem.uri ?? undefined)
                            : s.header.totalHeaderItem.type
                        : undefined;

                    return newAttributeColumnLocator(attributeId, element);
                });

                return {
                    locators,
                    wrapText,
                    wrapHeaderText,
                    matchType: "pivotGroup", // Pivot group matching
                };
            }

            // Otherwise, create individual column locators (default behavior)
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

            return {
                locators: [
                    ...attributeAndTotalLocators,
                    ...measureIds.map((localId) => newMeasureColumnLocator(localId)),
                ],
                wrapText,
                wrapHeaderText,
            };
        }
        case "measureGroupHeader":
        case "measureGroupValue": {
            const measureIds = columnDefinition.measureGroupDescriptor.measureGroupHeader.items.map(
                (item) => item.measureHeaderItem.localIdentifier,
            );

            return {
                locators: measureIds.map((localId) => newMeasureColumnLocator(localId)),
                wrapText,
                wrapHeaderText,
            };
        }
        default: {
            assertNever(columnDefinition);
            throw new UnexpectedSdkError(`Unknown column definition: ${JSON.stringify(columnDefinition)}`);
        }
    }
}
