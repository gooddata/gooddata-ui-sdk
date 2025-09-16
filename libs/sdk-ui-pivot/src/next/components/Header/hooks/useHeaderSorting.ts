// (C) 2025 GoodData Corporation

import { MouseEvent, useCallback } from "react";

import { getNextSortState } from "../../../features/sorting/getNextSortState.js";
import { AgGridHeaderParams } from "../../../types/agGrid.js";

/**
 * Custom hook that provides common sorting functionality for header components.
 * Handles the sort state cycling and AgGrid API interactions.
 *
 * @param params - AgGrid header parameters
 * @returns Object with sorting-related functions and state
 * @internal
 */
export function useHeaderSorting(params: AgGridHeaderParams) {
    // Handle sorting when header is clicked
    const handleSort = useCallback(() => {
        // Get next sort state based on column's configured sortingOrder
        const nextSort = getNextSortState(params.column);

        // Use AgGrid's built-in setSort function if available
        if (params.setSort) {
            params.setSort(nextSort, false); // false = don't add to existing sort
        } else {
            // Fallback to manual column state management
            params.api.applyColumnState({
                state: [{ colId: params.column.getColId(), sort: nextSort }],
                defaultState: { sort: null },
            });
        }

        // Trigger server-side data refresh to apply the sort
        params.api.refreshServerSide({ purge: false });
    }, [params]);

    // Get current sort state for styling
    const currentSort = params.column.getSort();

    // Simple click handler that triggers sorting
    const handleHeaderClick = useCallback(
        (e: MouseEvent) => {
            const colDef = params.column.getColDef();
            if (colDef.sortable) {
                e.preventDefault();
                e.stopPropagation();
                handleSort();
            }
        },
        [params.column, handleSort],
    );

    return {
        currentSort,
        handleSort,
        handleHeaderClick,
    };
}
