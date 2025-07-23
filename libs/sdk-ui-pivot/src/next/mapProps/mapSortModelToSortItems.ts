// (C) 2025 GoodData Corporation
import {
    ISortItem,
    SortDirection,
    newAttributeSort,
    newMeasureSort,
    IAttributeLocatorItem,
    IMeasureLocatorItem,
    ITotalLocatorItem,
    newMeasureSortFromLocators,
    IAttribute,
    IMeasure,
    attributeLocalId,
    measureLocalId,
} from "@gooddata/sdk-model";
import { SortModelItem } from "ag-grid-community";
import { ITableColumnDefinition, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { ITableColumnDefinitionByPivotOrLocalId } from "./mapDataViewToAgGridRowData.js";

/**
 * @internal
 */
function createSortItemFromColumnDefinition(
    sortDirection: SortDirection,
    columnDefinition: ITableColumnDefinition,
): ISortItem {
    // Simple attribute sort
    if (columnDefinition.type === "attribute") {
        return newAttributeSort(
            columnDefinition.attributeDescriptor.attributeHeader.localIdentifier,
            sortDirection,
        );
    }

    // Simple measure sort
    if (
        columnDefinition.type === "value" &&
        columnDefinition.columnScope.length === 1 &&
        columnDefinition.columnScope[0].type === "measureScope"
    ) {
        return newMeasureSort(
            columnDefinition.columnScope[0].descriptor.measureHeaderItem.localIdentifier,
            sortDirection,
        );
    }

    // Pivoted sort
    if (columnDefinition.type === "value" || columnDefinition.type === "subtotal") {
        const attributeLocators: IAttributeLocatorItem[] = [];
        const totalLocators: ITotalLocatorItem[] = [];
        const measureLocators: IMeasureLocatorItem[] = [];

        columnDefinition.columnScope.forEach((scope) => {
            if (scope.type === "attributeScope") {
                attributeLocators.push({
                    attributeLocatorItem: {
                        attributeIdentifier: scope.descriptor.attributeHeader.localIdentifier,
                        element: scope.header.attributeHeaderItem.name,
                    },
                });
            } else if (scope.type === "attributeTotalScope") {
                totalLocators.push({
                    totalLocatorItem: {
                        attributeIdentifier: scope.descriptor.attributeHeader.localIdentifier,
                        totalFunction: scope.header.totalHeaderItem.type,
                    },
                });
            } else if (scope.type === "measureScope" || scope.type === "measureTotalScope") {
                measureLocators.push({
                    measureLocatorItem: {
                        measureIdentifier: scope.descriptor.measureHeaderItem.localIdentifier,
                    },
                });
            }
        });

        if (!measureLocators.length) {
            throw new UnexpectedSdkError(
                `No measure locators found for column definition: ${JSON.stringify(columnDefinition)}`,
            );
        }

        // Create measure sort item with all locators
        return newMeasureSortFromLocators(
            [...attributeLocators, ...totalLocators, ...measureLocators],
            sortDirection,
        );
    }

    throw new UnexpectedSdkError(`Unexpected column definition type for sorting: ${columnDefinition.type}`);
}

/**
 * Determines the desired sorts for the current request, handling the first call specially
 * to prevent double loading when initial sorts are provided.
 *
 * @param isFirstRequest - Whether this is the very first call to getRows since datasource creation
 * @param sortModel - The sort model from AG Grid
 * @param initialSortBy - The initial sort configuration
 * @param rows - Row attributes for mapping
 * @param measures - Measures for mapping
 * @param isPivotMode - Whether we're in pivot mode
 * @param resultMetadata - Metadata for pivot result fields
 *
 * @returns The desired sort items to apply
 */
export function getDesiredSorts(
    isFirstRequest: boolean,
    sortModel: SortModelItem[] | undefined,
    initialSortBy: ISortItem[],
    columnDefinitionByColId: ITableColumnDefinitionByPivotOrLocalId,
): ISortItem[] {
    // On the very first call ever, use the initial sortBy if sortModel is empty
    // This prevents double loading while ensuring initial sort is applied
    if (isFirstRequest && (!sortModel || sortModel.length === 0) && initialSortBy.length > 0) {
        return initialSortBy;
    }

    // If no sortModel, return empty array
    if (!sortModel || sortModel.length === 0) {
        return [];
    }

    const sortItems: ISortItem[] = [];

    for (const sortItem of sortModel) {
        const { colId, sort } = sortItem;
        if (!colId || !sort) continue;

        // Check if we have column definition for this colId
        const columnDefinition = columnDefinitionByColId[colId];
        if (columnDefinition) {
            // Use metadata-based sorting instead of parsing
            const pivotSortItem = createSortItemFromColumnDefinition(sort, columnDefinition);
            sortItems.push(pivotSortItem);
        } else {
            console.warn(`No column definition found for colId: ${colId}`);
        }
    }

    return sortItems;
}

/**
 * Maps AG Grid sort model to sort items.
 *
 * @param sortModel - The sort model from AG Grid
 * @param rows - Row attributes for mapping
 * @param measures - Measures for mapping
 * @returns Array of sort items
 *
 * @internal
 */
export function mapSortModelToSortItems(
    sortModel: SortModelItem[],
    rows: IAttribute[],
    measures: IMeasure[],
): ISortItem[] {
    if (!sortModel || sortModel.length === 0) {
        return [];
    }

    const sortItems: ISortItem[] = [];

    for (const sortItem of sortModel) {
        const { colId, sort } = sortItem;
        if (!colId || !sort) continue;

        // First, try to match against attributes (rows)
        const matchingAttribute = rows.find((attr) => attributeLocalId(attr) === colId);

        if (matchingAttribute) {
            sortItems.push(newAttributeSort(matchingAttribute, sort));
            continue;
        }

        // If no attribute match, try to match against measures
        const matchingMeasure = measures.find((measure) => measureLocalId(measure) === colId);

        if (matchingMeasure) {
            sortItems.push(newMeasureSort(matchingMeasure, sort));
            continue;
        }

        console.warn(`No matching attribute or measure found for colId: ${colId}`);
    }

    return sortItems;
}
