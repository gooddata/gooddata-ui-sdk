// (C) 2025 GoodData Corporation

import { type MouseEvent, useCallback } from "react";

import { type IntlShape, useIntl } from "react-intl";

import { messages } from "../../../locales.js";
import { getSortModel } from "../../features/sorting/agGridSortingApi.js";
import {
    type AgGridColumnDef,
    type AgGridHeaderGroupParams,
    type AgGridHeaderParams,
    isAgGridHeaderParams,
} from "../../types/agGrid.js";
import { type ISortingMenuItem } from "../../types/menu.js";

type SortDirection = "asc" | "desc";

/**
 * Get localized sort direction label (ascending/descending).
 */
function getDirectionLabel(intl: IntlShape, direction: SortDirection): string {
    return direction === "asc"
        ? intl.formatMessage(messages["ariaSortedAscending"])
        : intl.formatMessage(messages["ariaSortedDescending"]);
}

/**
 * Build localized "sorted [direction], rank [N]" string for ARIA labels.
 */
function buildSortedWithRankLabel(
    intl: IntlShape,
    sortDirection: SortDirection,
    sortIndex: number | undefined,
): string {
    const sorted = intl.formatMessage(messages["ariaSorted"], {
        direction: getDirectionLabel(intl, sortDirection),
    });
    const rankInfo =
        sortIndex === undefined
            ? ""
            : `, ${intl.formatMessage(messages["ariaPriority"], { rank: sortIndex + 1 })}`;

    return `${sorted}${rankInfo}`;
}

/**
 * Hook for header menu sorting functionality.
 *
 * @internal
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

    // Direct sort setter for menu interactions (always multisort)
    const handleSetSort = useCallback(
        (direction: SortDirection | null) => {
            if (isRegularHeader) {
                params.setSort(direction, true);
            }
        },
        [params, isRegularHeader],
    );

    // Get column name for ARIA labels
    const columnName = isRegularHeader ? params.displayName : "";

    // Build ARIA label for sorting menu items
    // Format: "[Column Name], sort [ascending/descending], [sorted ascending/descending, rank N]"
    const buildSortAriaLabel = (direction: SortDirection): string => {
        const sortAction =
            direction === "asc"
                ? intl.formatMessage(messages["sortAscending"])
                : intl.formatMessage(messages["sortDescending"]);

        if (sortDirection) {
            return `${columnName}, ${sortAction}, ${buildSortedWithRankLabel(intl, sortDirection, sanitizedSortIndex)}`;
        }

        return `${columnName}, ${sortAction}`;
    };

    const sortingItems: ISortingMenuItem[] = allowSorting
        ? [
              {
                  type: "sorting",
                  id: "sort-asc",
                  direction: "asc",
                  title: intl.formatMessage(messages["sortAscending"]),
                  isActive: sortDirection === "asc",
                  ariaLabel: buildSortAriaLabel("asc"),
              },
              {
                  type: "sorting",
                  id: "sort-desc",
                  direction: "desc",
                  title: intl.formatMessage(messages["sortDescending"]),
                  isActive: sortDirection === "desc",
                  ariaLabel: buildSortAriaLabel("desc"),
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

    // Progress sort for header clicks (respects AG Grid default: regular sort, Shift+click for multisort)
    const handleProgressSort = useCallback(
        (event: MouseEvent<HTMLDivElement> | KeyboardEvent) => {
            if (isRegularHeader) {
                // Check if Shift key is pressed to enable multisort
                const isShiftPressed = "shiftKey" in event ? event.shiftKey : false;
                params.progressSort(isShiftPressed);
            }
        },
        [params, isRegularHeader],
    );

    // Build ARIA label for the header cell itself
    // Format: "[Column Name], sorted [ascending/descending], rank [N]"
    // Note: Keyboard instructions are provided via AG Grid's ariaSortableColumn locale text
    const headerCellAriaLabel = sortDirection
        ? `${columnName}, ${buildSortedWithRankLabel(intl, sortDirection, sanitizedSortIndex)}`
        : columnName;

    return {
        sortDirection,
        sortIndex: sanitizedSortIndex,
        sortingItems,
        handleSortingItemClick,
        handleProgressSort,
        headerCellAriaLabel,
    };
}
