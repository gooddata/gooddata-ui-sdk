// (C) 2025 GoodData Corporation
import {
    IAttribute,
    IMeasure,
    ISortItem,
    SortDirection,
    newAttributeSort,
    newMeasureSort,
    IAttributeLocatorItem,
    IMeasureLocatorItem,
} from "@gooddata/sdk-model";
import { SortModelItem } from "ag-grid-community";
import { IPivotResultFieldMetadata, IPivotResultFieldMetadataObject } from "./mapDataViewToAgGridRowData.js";

/**
 * Map AG Grid sort model to sort items.
 *
 * @param sortModel - AG Grid sort model
 * @param rows - Row attributes from pivot table props
 * @param measures - Measures from pivot table props
 * @returns Array of sort items
 */
export function mapSortModelToSortItems(
    sortModel: SortModelItem[],
    rows: IAttribute[],
    measures: IMeasure[],
): ISortItem[] {
    const sortItems: ISortItem[] = [];

    for (const sortItem of sortModel) {
        const { colId, sort } = sortItem;

        if (!colId || !sort) {
            continue;
        }

        // Check if this is an attribute sort (row attribute)
        const attribute = rows.find((attr) => attr.attribute.localIdentifier === colId);
        if (attribute) {
            sortItems.push(
                newAttributeSort(attribute.attribute.localIdentifier, sort === "asc" ? "asc" : "desc"),
            );
            continue;
        }

        // Check if this is a measure sort
        const measure = measures.find((m) => m.measure.localIdentifier === colId);
        if (measure) {
            sortItems.push(newMeasureSort(measure.measure.localIdentifier, sort === "asc" ? "asc" : "desc"));
            continue;
        }

        console.warn(`Unable to map sort for column: ${colId}`);
    }

    return sortItems;
}

/**
 * Creates a sort item for a pivot column using metadata instead of parsing colId.
 * This approach uses the structured metadata to build locators directly.
 *
 * @param colId - The column ID from sortModel (used as key in metadata)
 * @param sortDirection - The sort direction
 * @param metadata - The metadata for the pivot result field
 *
 * @returns A proper measure sort item with locators
 */
function createSortItemFromMetadata(
    colId: string,
    sortDirection: SortDirection,
    metadata: IPivotResultFieldMetadata,
): ISortItem | null {
    try {
        if (!metadata.measure) {
            return null;
        }

        // Create attribute locators using metadata column attributes and their corresponding headers
        const attributeLocators: IAttributeLocatorItem[] = [];

        metadata.columnAttributes.forEach((attributeDescriptor, index) => {
            if (index < metadata.attributeHeaders.length) {
                const attributeHeader = metadata.attributeHeaders[index];
                const attributeValue = attributeHeader.attributeHeaderItem.name ?? "(empty value)";
                attributeLocators.push({
                    attributeLocatorItem: {
                        attributeIdentifier: attributeDescriptor.attributeHeader.localIdentifier,
                        element: attributeValue,
                    },
                });
            }
        });

        // Create measure locator
        const measureLocator: IMeasureLocatorItem = {
            measureLocatorItem: {
                measureIdentifier: metadata.measure.measureHeaderItem.localIdentifier,
            },
        };

        // Create measure sort item with all locators
        return {
            measureSortItem: {
                direction: sortDirection,
                locators: [...attributeLocators, measureLocator],
            },
        };
    } catch (error) {
        console.warn("Failed to create sort item from metadata:", colId, error);
        return null;
    }
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
    rows: IAttribute[],
    measures: IMeasure[],
    isPivotMode: boolean,
    resultMetadata: IPivotResultFieldMetadataObject,
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

    // Handle pivot mode sorting using metadata
    if (isPivotMode) {
        const sortItems: ISortItem[] = [];

        for (const sortItem of sortModel) {
            const { colId, sort } = sortItem;
            if (!colId || !sort) continue;

            // First check if this is a simple row attribute or measure
            const simpleSortItem = mapSortModelToSortItems([sortItem], rows, measures);
            if (simpleSortItem.length > 0) {
                sortItems.push(simpleSortItem[0]);
                continue;
            }

            // Check if we have metadata for this colId
            const metadata = resultMetadata[colId];
            if (metadata) {
                // Use metadata-based sorting instead of parsing
                const pivotSortItem = createSortItemFromMetadata(
                    colId,
                    sort === "asc" ? "asc" : "desc",
                    metadata,
                );
                if (pivotSortItem) {
                    sortItems.push(pivotSortItem);
                }
            } else {
                console.warn(`No metadata found for pivot column: ${colId}`);
            }
        }

        return sortItems;
    }

    // For non-pivot mode, use the existing mapping
    return mapSortModelToSortItems(sortModel, rows, measures);
}
