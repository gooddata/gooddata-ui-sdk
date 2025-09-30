// (C) 2025 GoodData Corporation

import { MouseEvent } from "react";

import { IAttributeDescriptor } from "@gooddata/sdk-model";

import { useHeaderDrilling } from "./useHeaderDrilling.js";
import { useHeaderMenuAggregations } from "./useHeaderMenuAggregations.js";
import { useHeaderMenuSorting } from "./useHeaderMenuSorting.js";
import { useHeaderMenuTextWrapping } from "./useHeaderMenuTextWrapping.js";
import { AgGridHeaderParams } from "../../types/agGrid.js";

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
    options: {
        allowAggregations: boolean;
        allowTextWrapping: boolean;
        allowSorting: boolean;
        allowDrilling: boolean;
    },
    additionalContext: {
        measureIdentifiers: string[];
        pivotAttributeDescriptors: IAttributeDescriptor[];
    },
    agGridHeaderParams: AgGridHeaderParams | null,
) {
    const { allowAggregations, allowTextWrapping, allowSorting, allowDrilling } = options;
    const { measureIdentifiers, pivotAttributeDescriptors } = additionalContext;

    // Aggregations
    const { aggregationsItems, handleAggregationsItemClick } = useHeaderMenuAggregations(
        measureIdentifiers,
        pivotAttributeDescriptors,
    );

    const sanitizedAggregationProps = allowAggregations
        ? { aggregationsItems, handleAggregationsItemClick }
        : { aggregationsItems: [], handleAggregationsItemClick: () => {} };

    // Text wrapping
    const { textWrappingItems, handleTextWrappingItemClick } = useHeaderMenuTextWrapping();

    const sanitizedTextWrappingProps = allowTextWrapping
        ? { textWrappingItems, handleTextWrappingItemClick }
        : { textWrappingItems: [], handleTextWrappingItemClick: () => {} };

    // Sorting
    const { sortDirection, sortIndex, sortingItems, handleSortingItemClick, handleProgressSort } =
        useHeaderMenuSorting(agGridHeaderParams);

    const sanitizedSortingProps = allowSorting
        ? { sortingItems, sortDirection, sortIndex, handleSortingItemClick, handleProgressSort }
        : {
              sortingItems: [],
              sortDirection: undefined,
              sortIndex: undefined,
              handleSortingItemClick: () => {},
              handleProgressSort: () => {},
          };

    // Drills
    const { handleHeaderDrill, isDrillable } = useHeaderDrilling(agGridHeaderParams);

    const sanitizedDrillingProps = allowDrilling
        ? { handleHeaderDrill, isDrillable }
        : { handleHeaderDrill: () => {}, isDrillable: false };

    const handleHeaderClick = (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (allowSorting) {
            handleProgressSort();
        }

        if (allowDrilling) {
            handleHeaderDrill(event);
        }
    };

    const hasMenuItems =
        [
            ...sanitizedAggregationProps.aggregationsItems,
            ...sanitizedTextWrappingProps.textWrappingItems,
            ...sanitizedSortingProps.sortingItems,
        ].length > 0;

    return {
        ...sanitizedAggregationProps,
        ...sanitizedTextWrappingProps,
        ...sanitizedSortingProps,
        ...sanitizedDrillingProps,
        handleHeaderClick,
        hasMenuItems,
    };
}
