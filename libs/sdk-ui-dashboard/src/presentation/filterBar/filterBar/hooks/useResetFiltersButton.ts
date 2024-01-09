// (C) 2023-2024 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual.js";
import partition from "lodash/partition.js";
import difference from "lodash/difference.js";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
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
    selectDisableDashboardCrossFiltering,
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
    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering);

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
        const [[commonDateFilter], otherFilters] = partition(
            originalFilters,
            isDashboardCommonDateFilter,
        ) as [IDashboardDateFilter[], Array<IDashboardAttributeFilter | IDashboardDateFilter>];

        // Dispatch a command, so it goes through the proper piping and trigger all the events
        dispatch(
            changeFilterContextSelection([
                commonDateFilter ?? newAllTimeDashboardDateFilter(),
                ...otherFilters,
            ]),
        );
        if (enableKDCrossFiltering && supportsCrossFiltering && !disableCrossFiltering) {
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
        disableCrossFiltering,
    ]);

    return [canReset, resetFilters];
};
