// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../../locales.js";
import { getSortModel } from "../../features/sorting/agGridSortingApi.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";
import { ISortingMenuItem } from "../../types/menu.js";

/**
 * Renderer for attribute header.
 */
export function useHeaderMenuSorting(params: AgGridHeaderParams | null) {
    const intl = useIntl();
    const colDef = params?.column.getColDef() as AgGridColumnDef | null;
    const allowSorting = !!colDef?.sortable;

    // Get current sort state for styling
    const sortDirection = params?.column.getSort();
    const sortModel = params ? getSortModel(params.api) : [];
    const sortIndex = params?.column.getSortIndex() ?? undefined;
    const sanitizedSortIndex = sortModel.length > 1 ? sortIndex : undefined; // Show sort index only in case there is multi-sort

    // Direct sort setter for menu interactions
    const handleSetSort = useCallback(
        (direction: "asc" | "desc" | null) => {
            params?.setSort(direction, true);
        },
        [params],
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

    const handleSortingItemClick = (item: ISortingMenuItem) => {
        if (!allowSorting) {
            return;
        }

        if (item.direction === sortDirection) {
            handleSetSort(null);
            return;
        }

        handleSetSort(item.direction);
    };

    const handleProgressSort = useCallback(() => {
        params?.progressSort(true);
    }, [params]);

    return params
        ? {
              sortDirection,
              sortIndex: sanitizedSortIndex,
              sortingItems,
              handleSortingItemClick,
              handleProgressSort,
          }
        : {
              sortDirection: undefined,
              sortIndex: undefined,
              sortingItems: [],
              handleSortingItemClick: () => {},
              handleProgressSort: () => {},
          };
}
