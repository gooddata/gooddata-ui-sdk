// (C) 2025 GoodData Corporation
import { SortModelItem } from "ag-grid-enterprise";
import {
    ISortItem,
    SortDirection,
    newAttributeSort,
    newMeasureSortFromLocators,
    isAttributeSort,
    isMeasureSort,
    ILocatorItem,
    newAttributeLocator,
} from "@gooddata/sdk-model";
import { ITableColumnDefinition, ITableDataHeaderScope } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual.js";
import { ITableColumnDefinitionByColId } from "../../types/internal.js";

export function sortModelToSortItems(
    sortModel: SortModelItem[],
    columnDefinitionByColId: ITableColumnDefinitionByColId,
): ISortItem[] {
    return sortModel.flatMap((sort): ISortItem[] => {
        const columnDefinition = columnDefinitionByColId[sort.colId];
        const columnSort = columnDefinition
            ? createSortForColumnDefinition(columnDefinition, sort.sort)
            : undefined;

        if (columnSort) {
            return [columnSort];
        }

        return [];
    });
}

/**
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

/**
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

function columnScopeToLocators(columnScope: ITableDataHeaderScope[]): ILocatorItem[] {
    return columnScope.flatMap((scope): ILocatorItem[] => {
        if (scope.type === "attributeScope" && scope.header.attributeHeaderItem.name) {
            return [
                newAttributeLocator(
                    scope.descriptor.attributeHeader.localIdentifier,
                    scope.header.attributeHeaderItem.name,
                ),
            ];
        }

        if (scope.type === "attributeTotalScope") {
            return [
                {
                    totalLocatorItem: {
                        attributeIdentifier: scope.descriptor.attributeHeader.localIdentifier,
                        totalFunction: scope.header.totalHeaderItem.type,
                    },
                },
            ];
        }

        if (scope.type === "measureTotalScope" || scope.type === "measureScope") {
            return [
                {
                    measureLocatorItem: {
                        measureIdentifier: scope.descriptor.measureHeaderItem.localIdentifier,
                    },
                },
            ];
        }

        return [];
    });
}
