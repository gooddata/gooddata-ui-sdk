// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../locales.js";
import { getSortModel } from "../../features/sorting/agGridSortingApi.js";
import {
    AgGridColumnDef,
    AgGridHeaderGroupParams,
    AgGridHeaderParams,
    isAgGridHeaderParams,
} from "../../types/agGrid.js";
import { ISortingMenuItem } from "../../types/menu.js";

/**
 * Renderer for attribute header.
 */
export function useHeaderMenuSorting(params: AgGridHeaderParams | AgGridHeaderGroupParams | null) {
    const intl = useIntl();

    // Only regular header params support sorting (not group headers)
    const isRegularHeader = isAgGridHeaderParams(params);

    const colDef = isRegularHeader ? (params.column.getColDef() as AgGridColumnDef) : undefined;
    const allowSorting = !!colDef?.sortable;

    // Get current sort state for styling
    const sortDirection = isRegularHeader ? params.column.getSort() : undefined;
    const sortModel = isRegularHeader ? getSortModel(params.api) : [];
    const sortIndex = isRegularHeader ? (params.column.getSortIndex() ?? undefined) : undefined;
    const sanitizedSortIndex = sortModel.length > 1 ? sortIndex : undefined; // Show sort index only in case there is multi-sort

    // Direct sort setter for menu interactions
    const handleSetSort = useCallback(
        (direction: "asc" | "desc" | null) => {
            if (isRegularHeader) {
                params.setSort(direction, true);
            }
        },
        [params, isRegularHeader],
    );

    const sortingItems: ISortingMenuItem[] = allowSorting
        ? [
              {
                  type: "sorting",
                  id: "sort-asc",
                  direction: "asc",
                  title: intl.formatMessage(messages["sortAscending"]),
                  isActive: sortDirection === "asc",
              },
              {
                  type: "sorting",
                  id: "sort-desc",
                  direction: "desc",
                  title: intl.formatMessage(messages["sortDescending"]),
                  isActive: sortDirection === "desc",
              },
          ]
        : [];

    const handleSortingItemClick = useCallback(
        (item: ISortingMenuItem) => {
            if (!allowSorting) {
                return;
            }

            if (item.direction === sortDirection) {
                handleSetSort(null);
                return;
            }

            handleSetSort(item.direction);
        },
        [allowSorting, sortDirection, handleSetSort],
    );

    const handleProgressSort = useCallback(() => {
        if (isRegularHeader) {
            params.progressSort(true);
        }
    }, [params, isRegularHeader]);

    return {
        sortDirection,
        sortIndex: sanitizedSortIndex,
        sortingItems,
        handleSortingItemClick,
        handleProgressSort,
    };
}
