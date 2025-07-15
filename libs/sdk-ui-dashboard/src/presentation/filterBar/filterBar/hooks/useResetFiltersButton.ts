// (C) 2023-2025 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual.js";
import partition from "lodash/partition.js";
import difference from "lodash/difference.js";
import {
    dashboardFilterLocalIdentifier,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
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
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectIsDisabledCrossFiltering,
    selectIsDisableUserFilterReset,
    selectIsWorkingFilterContextChanged,
    resetFilterContextWorkingSelection,
    selectEnableDateFilterIdentifiers,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
} from "../../../../model/index.js";
import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";

/**
 * @returns tuple with two items:
 * - a boolean specifying if the reset option makes sense for a given state (i.e. if the button should be visible)
 * - a function that will reset the filters
 *
 * @internal
 */
export const useResetFiltersButton = (): {
    canReset: boolean;
    resetType: "all" | "crossFilter";
    resetFilters: () => void;
} => {
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const originalFilters = useDashboardSelector(selectOriginalFilterContextFilters);
    const currentFilters = useDashboardSelector(selectFilterContextFilters);
    const enableKDCrossFiltering = useDashboardSelector(selectEnableKDCrossFiltering);
    const supportsCrossFiltering = useDashboardSelector(selectSupportsCrossFiltering);
    const disableCrossFilteringByConfig = useDashboardSelector(selectIsDisabledCrossFiltering);
    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering);
    const disableUserFilterResetByConfig = useDashboardSelector(selectIsDisableUserFilterReset);
    const disableUserFilterReset = useDashboardSelector(selectDisableDashboardUserFilterReset);
    const isWorkingFilterContextChanged = useDashboardSelector(selectIsWorkingFilterContextChanged);
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const enableDateFilterIdentifiers = useDashboardSelector(selectEnableDateFilterIdentifiers);

    const dispatch = useDashboardDispatch();
    const { filterContextStateReset } = useDashboardUserInteraction();

    const newlyAddedFiltersLocalIds = React.useMemo(() => {
        const originalAttributeFiltersLocalIds = originalFilters
            .filter(isDashboardAttributeFilter)
            .map((filter) => filter.attributeFilter.localIdentifier!);
        const currentFiltersLocalIds = currentFilters
            .filter(isDashboardAttributeFilter)
            .map((filter) => filter.attributeFilter.localIdentifier!);
        return difference(currentFiltersLocalIds, originalAttributeFiltersLocalIds);
    }, [currentFilters, originalFilters]);

    const sanitizedCurrentFilters = React.useMemo(() => {
        // When date filter identifiers are enabled and original filters do not have identifiers yet,
        // we omit them in current filters to avoid false positive results when comparing the objects
        const shouldIgnoreDateFilterLocalIdentifiers =
            enableDateFilterIdentifiers &&
            originalFilters.some(
                (filter) =>
                    isDashboardDateFilter(filter) && dashboardFilterLocalIdentifier(filter) === undefined,
            );

        return shouldIgnoreDateFilterLocalIdentifiers
            ? currentFilters.map((filter) => {
                  if (isDashboardDateFilter(filter)) {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { localIdentifier, ...rest } = filter.dateFilter;
                      return {
                          ...filter,
                          dateFilter: {
                              ...rest,
                          },
                      };
                  }
                  return filter;
              })
            : currentFilters;
    }, [enableDateFilterIdentifiers, originalFilters, currentFilters]);

    const canReset = React.useMemo((): boolean => {
        return (
            !isEditMode &&
            ((!isEqual(sanitizedCurrentFilters, originalFilters) &&
                // If the cross filter add some filters, we should allow the reset
                ((!disableUserFilterReset && !disableUserFilterResetByConfig) ||
                    newlyAddedFiltersLocalIds.length > 0)) ||
                (!!isWorkingFilterContextChanged && isApplyAllAtOnceEnabledAndSet))
        );
    }, [
        isEditMode,
        sanitizedCurrentFilters,
        originalFilters,
        disableUserFilterReset,
        disableUserFilterResetByConfig,
        newlyAddedFiltersLocalIds.length,
        isWorkingFilterContextChanged,
        isApplyAllAtOnceEnabledAndSet,
    ]);

    const resetFilters = React.useCallback(() => {
        if (!canReset) {
            return;
        }

        // If the user filter reset is disabled, we should keep the filters that were added by the user
        if (!disableUserFilterReset) {
            // Normalize filters to include "All time" date filter
            const [[commonDateFilter], otherFilters] = partition(
                originalFilters,
                isDashboardCommonDateFilter,
            ) as [IDashboardDateFilter[], Array<IDashboardAttributeFilter | IDashboardDateFilter>];

            if (isApplyAllAtOnceEnabledAndSet) {
                dispatch(resetFilterContextWorkingSelection());
            }
            // Dispatch a command, so it goes through the proper piping and trigger all the events
            dispatch(
                changeFilterContextSelection([
                    commonDateFilter ??
                        newAllTimeDashboardDateFilter(
                            undefined,
                            enableDateFilterIdentifiers
                                ? generateDateFilterLocalIdentifier(0, undefined)
                                : undefined,
                        ),
                    ...otherFilters,
                ]),
            );
        }

        // If cross filtering is enabled, we need to remove all attribute filters that were added by cross filtering
        if (
            enableKDCrossFiltering &&
            supportsCrossFiltering &&
            !disableCrossFiltering &&
            !disableCrossFilteringByConfig
        ) {
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
        disableUserFilterReset,
        disableCrossFilteringByConfig,
        enableDateFilterIdentifiers,
        isApplyAllAtOnceEnabledAndSet,
    ]);

    return {
        canReset,
        resetType: disableUserFilterReset ? "crossFilter" : "all",
        resetFilters,
    };
};
