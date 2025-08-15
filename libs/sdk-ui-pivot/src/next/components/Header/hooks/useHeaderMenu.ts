// (C) 2025 GoodData Corporation

import { IAttributeDescriptor } from "@gooddata/sdk-model";
import { useHeaderMenuProps } from "./useHeaderMenuProps.js";
import { AgGridApi } from "../../../types/agGrid.js";

/**
 * Hook for header cell components that handles menu item filtering.
 *
 * @param allowAggregations - Whether aggregation menu items should be included
 * @param allowTextWrapping - Whether text wrapping menu items should be included
 * @param measureIdentifiers - Array of measure identifiers for the cell
 * @param pivotAttributeDescriptors - Array of pivot attribute descriptors
 * @param gridApi - Optional ag-grid API for checking current state
 * @returns Filtered menu items and handlers based on permissions
 */
export function useHeaderMenu(
    allowAggregations: boolean,
    allowTextWrapping: boolean,
    measureIdentifiers: string[] = [],
    pivotAttributeDescriptors: IAttributeDescriptor[] = [],
    gridApi?: AgGridApi,
) {
    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenuProps(measureIdentifiers, pivotAttributeDescriptors, gridApi);

    const sanitizedAggregationsItems = allowAggregations ? aggregationsItems : [];
    const sanitizedTextWrappingItems = allowTextWrapping ? textWrappingItems : [];

    return {
        aggregationsItems: sanitizedAggregationsItems,
        textWrappingItems: sanitizedTextWrappingItems,
        handleAggregationsItemClick,
        handleTextWrappingItemClick,
    };
}
