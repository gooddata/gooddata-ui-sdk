// (C) 2025 GoodData Corporation
import { ISortItem, SortDirection, newAttributeSort, newMeasureSortFromLocators } from "@gooddata/sdk-model";
import { ITableColumnDefinition } from "@gooddata/sdk-ui";

import { columnScopeToLocators } from "./locators.js";

/**
 * Creates sort item for the provided column definition.
 *
 * @internal
 */
export function createSortForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    direction: SortDirection,
): ISortItem | undefined {
    if (columnDefinition.type === "attribute") {
        return newAttributeSort(
            columnDefinition.attributeDescriptor.attributeHeader.localIdentifier,
            direction,
        );
    }

    if (
        columnDefinition.type === "value" ||
        columnDefinition.type === "subtotal" ||
        columnDefinition.type === "grandTotal"
    ) {
        const locators = columnScopeToLocators(columnDefinition.columnScope);

        if (locators.length === 0) {
            return undefined;
        }

        return newMeasureSortFromLocators(locators, direction);
    }

    return undefined;
}
