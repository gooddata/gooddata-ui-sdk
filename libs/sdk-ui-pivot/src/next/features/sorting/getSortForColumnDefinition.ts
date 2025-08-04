// (C) 2025 GoodData Corporation
import { ISortItem, isAttributeSort, isMeasureSort } from "@gooddata/sdk-model";
import { ITableColumnDefinition } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual.js";
import { columnScopeToLocators } from "./locators.js";

/**
 * Returns sort item for the provided column definition, if match is found, undefined otherwise.
 *
 * @internal
 */
export function getSortForColumnDefinition(
    columnDefinition: ITableColumnDefinition,
    sortBy: ISortItem[],
): ISortItem | undefined {
    if (columnDefinition.type === "attribute") {
        return sortBy.find(
            (sort) =>
                isAttributeSort(sort) &&
                sort.attributeSortItem.attributeIdentifier ===
                    columnDefinition.attributeDescriptor.attributeHeader.localIdentifier,
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

        return sortBy.find((sort) => isMeasureSort(sort) && isEqual(sort.measureSortItem.locators, locators));
    }

    return undefined;
}
