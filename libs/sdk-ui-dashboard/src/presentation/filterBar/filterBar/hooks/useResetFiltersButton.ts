// (C) 2023 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual.js";
import partition from "lodash/partition.js";
import {
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    changeFilterContextSelection,
    selectFilterContextFilters,
    selectIsInEditMode,
    selectOriginalFilterContextFilters,
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
    const dispatch = useDashboardDispatch();
    const { filterContextStateReset } = useDashboardUserInteraction();

    const canReset = React.useMemo(() => {
        return !isEditMode && !isEqual(currentFilters, originalFilters);
    }, [originalFilters, currentFilters, isEditMode]);

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
        // Report the reset as user interaction
        filterContextStateReset();
    }, [dispatch, filterContextStateReset, originalFilters, canReset]);

    return [canReset, resetFilters];
};
