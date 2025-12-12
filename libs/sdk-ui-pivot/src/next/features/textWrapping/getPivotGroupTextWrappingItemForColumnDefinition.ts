// (C) 2025 GoodData Corporation

import { type ITableColumnDefinition } from "@gooddata/sdk-ui";

import { isAttributeColumnLocator } from "../../types/locators.js";
import { type IColumnTextWrappingItem } from "../../types/textWrapping.js";

/**
 * Returns {@link IColumnTextWrappingItem} for pivot group headers that match the provided {@link ITableColumnDefinition}.
 *
 * @remarks
 * This function checks if the column definition is part of a pivot group hierarchy
 * and returns the most specific matching pivot group text wrapping item.
 *
 * A group override matches if:
 * - The column definition has a column scope with attribute scopes
 * - The attribute locators match the beginning of the column scope (group and descendants)
 * - If elements are specified, they match the corresponding attribute values
 *
 * @internal
 */
export function getPivotGroupTextWrappingItemForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    columnTextWrapping: IColumnTextWrappingItem[],
): IColumnTextWrappingItem | undefined {
    // Only value, subtotal, and grandTotal columns can be part of pivot groups
    if (
        columnDefinition.type !== "value" &&
        columnDefinition.type !== "subtotal" &&
        columnDefinition.type !== "grandTotal"
    ) {
        return undefined;
    }

    const columnScope = columnDefinition.columnScope;
    if (!columnScope || columnScope.length === 0) {
        return undefined;
    }

    // Extract attribute scopes from column scope
    const attributeScopes = columnScope.filter(
        (scope) => scope.type === "attributeScope" || scope.type === "attributeTotalScope",
    );

    if (attributeScopes.length === 0) {
        return undefined;
    }

    // Find all matching pivot group items (matchType === "pivotGroup")
    const matchingItems: { item: IColumnTextWrappingItem; matchLength: number }[] = [];

    for (const item of columnTextWrapping) {
        // Skip if not a pivot group match type
        if (item.matchType !== "pivotGroup") {
            continue;
        }

        // Extract attribute identifiers and elements from locators
        const attributeLocators = item.locators.filter(isAttributeColumnLocator);

        // Check if this item matches the beginning of the column's attribute scopes
        if (attributeLocators.length > attributeScopes.length) {
            continue;
        }

        let matches = true;
        for (let i = 0; i < attributeLocators.length; i++) {
            const scope = attributeScopes[i];
            const locator = attributeLocators[i];
            const expectedIdentifier = locator.attributeLocatorItem.attributeIdentifier;

            // Check if attribute identifier matches
            if (scope.descriptor.attributeHeader.localIdentifier !== expectedIdentifier) {
                matches = false;
                break;
            }

            // If element is specified in locator, check if it matches
            const expectedElement = locator.attributeLocatorItem.element;
            if (expectedElement !== undefined) {
                let actualElement: string | null;

                if (scope.type === "attributeScope") {
                    actualElement = scope.header.attributeHeaderItem.uri ?? null;
                } else {
                    // attributeTotalScope
                    actualElement = scope.header.totalHeaderItem.type;
                }

                if (actualElement !== expectedElement) {
                    matches = false;
                    break;
                }
            }
        }

        if (matches) {
            matchingItems.push({
                item,
                matchLength: attributeLocators.length,
            });
        }
    }

    // Return the most specific match (longest match, then with elements over without)
    if (matchingItems.length === 0) {
        return undefined;
    }

    matchingItems.sort((a, b) => {
        // First, sort by match length (longer is more specific)
        if (a.matchLength !== b.matchLength) {
            return b.matchLength - a.matchLength;
        }

        // If same length, prefer one with elements (more specific) over one without
        const aAttributeLocators = a.item.locators.filter(isAttributeColumnLocator);
        const bAttributeLocators = b.item.locators.filter(isAttributeColumnLocator);

        // Count how many locators have elements defined
        const aHasElements = aAttributeLocators.filter(
            (loc) => loc.attributeLocatorItem.element !== undefined,
        ).length;
        const bHasElements = bAttributeLocators.filter(
            (loc) => loc.attributeLocatorItem.element !== undefined,
        ).length;

        return bHasElements - aHasElements;
    });
    return matchingItems[0].item;
}
