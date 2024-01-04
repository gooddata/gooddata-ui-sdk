// (C) 2023 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual.js";
import partition from "lodash/partition.js";
import difference from "lodash/difference.js";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    changeFilterContextSelection,
    removeAttributeFilters,
    selectEnableKDCrossFiltering,
    selectFilterContextFilters,
    selectIsInEditMode,
    selectOriginalFilterContextFilters,
    selectSupportsCrossFiltering,
    drillActions,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardUserInteraction,
} from "../../../../model/index.js";

/**
 * @returns tuple with two items:
 * - a boolean specifying if the reset option makes sense for a given state (i.e. if the button should be visible)
 * - a function that will reset the filters
 *
 * @internal
 */
export const useResetFiltersButton = (): [boolean, () => void] => {
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const originalFilters = useDashboardSelector(selectOriginalFilterContextFilters);
    const currentFilters = useDashboardSelector(selectFilterContextFilters);
    const enableKDCrossFiltering = useDashboardSelector(selectEnableKDCrossFiltering);
    const supportsCrossFiltering = useDashboardSelector(selectSupportsCrossFiltering);
    const dispatch = useDashboardDispatch();
    const { filterContextStateReset } = useDashboardUserInteraction();

    const canReset = React.useMemo(() => {
        return !isEditMode && !isEqual(currentFilters, originalFilters);
    }, [originalFilters, currentFilters, isEditMode]);

    const newlyAddedFiltersLocalIds = React.useMemo(() => {
        const originalAttributeFiltersLocalIds = originalFilters
            .filter(isDashboardAttributeFilter)
            .map((filter) => filter.attributeFilter.localIdentifier!);
        const currentFiltersLocalIds = currentFilters
            .filter(isDashboardAttributeFilter)
            .map((filter) => filter.attributeFilter.localIdentifier!);
        return difference(currentFiltersLocalIds, originalAttributeFiltersLocalIds);
    }, [currentFilters, originalFilters]);

    const resetFilters = React.useCallback(() => {
        if (!canReset) {
            return;
        }

        // Normalize filters to include "All time" date filter
        const [[dateFilter], attributeFilters] = partition(originalFilters, isDashboardDateFilter) as [
            IDashboardDateFilter[],
            IDashboardAttributeFilter[],
        ];

        // Dispatch a command, so it goes through the proper piping and trigger all the events
        dispatch(
            changeFilterContextSelection([
                dateFilter ?? newAllTimeDashboardDateFilter(),
                ...attributeFilters,
            ]),
        );
        if (enableKDCrossFiltering && supportsCrossFiltering) {
            dispatch(removeAttributeFilters(newlyAddedFiltersLocalIds));
            dispatch(drillActions.resetCrossFiltering());
        }
        // Report the reset as user interaction
        filterContextStateReset();
    }, [
        canReset,
        originalFilters,
        dispatch,
        enableKDCrossFiltering,
        supportsCrossFiltering,
        filterContextStateReset,
        newlyAddedFiltersLocalIds,
    ]);

    return [canReset, resetFilters];
};
