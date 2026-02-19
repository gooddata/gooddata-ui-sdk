// (C) 2023-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { difference, isEqual, partition } from "lodash-es";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    dashboardFilterLocalIdentifier,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isNoopAllTimeDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    changeFilterContextSelection,
    removeAttributeFilters,
    resetFilterContextWorkingSelection,
} from "../../../../model/commands/filters.js";
import { filterContextSelectionReset } from "../../../../model/events/filters.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../../../model/react/useDashboardEventDispatch.js";
import { useDashboardUserInteraction } from "../../../../model/react/useDashboardUserInteraction.js";
import { selectSupportsCrossFiltering } from "../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableDateFilterIdentifiers,
    selectEnableKDCrossFiltering,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsDisableUserFilterReset,
    selectIsDisabledCrossFiltering,
} from "../../../../model/store/config/configSelectors.js";
import { drillActions } from "../../../../model/store/drill/index.js";
import {
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
} from "../../../../model/store/meta/metaSelectors.js";
import { selectIsInEditMode } from "../../../../model/store/renderMode/renderModeSelectors.js";
import {
    selectFilterContextFilters,
    selectIsWorkingFilterContextChanged,
    selectOriginalFilterContextFilters,
} from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../../../model/store/tabs/tabsSelectors.js";

const isNoopAllTimeCommonDateFilter = (filter: FilterContextItem): boolean => {
    return isDashboardCommonDateFilter(filter) && isNoopAllTimeDashboardDateFilter(filter);
};

const normalizeDateFilterForComparison = (filter: IDashboardDateFilter): IDashboardDateFilter => {
    /**
     * Filter objects can be created in different shapes:
     * - `{ dataSet: undefined }` (explicit undefined)
     * - no `dataSet` key at all (omitted)
     *
     * They are semantically the same for common date filters, but deep equality would treat them as different.
     * Normalize by stripping `undefined` keys from the `dateFilter` object.
     */
    const { dataSet, from, to, ...rest } = filter.dateFilter;

    return {
        ...filter,
        dateFilter: {
            ...rest,
            ...(dataSet === undefined ? {} : { dataSet }),
            ...(from === undefined ? {} : { from }),
            ...(to === undefined ? {} : { to }),
        } as IDashboardDateFilter["dateFilter"],
    };
};

const normalizeFilterForComparison = (filter: FilterContextItem): FilterContextItem => {
    return isDashboardDateFilter(filter) ? normalizeDateFilterForComparison(filter) : filter;
};

const normalizeFiltersForComparison = (filters: FilterContextItem[]): FilterContextItem[] => {
    const normalized = filters.map(normalizeFilterForComparison);

    // Remove any "all time" common date filters to normalize the comparison
    return normalized.filter((filter) => {
        return !isNoopAllTimeCommonDateFilter(filter);
    });
};

const shouldIgnoreDateFilterLocalIdentifiers = (
    enableDateFilterIdentifiers: boolean,
    originalFilters: FilterContextItem[],
): boolean => {
    // When date filter identifiers are enabled and original filters do not have identifiers yet,
    // we omit them in current filters to avoid false positive results when comparing the objects
    return (
        enableDateFilterIdentifiers &&
        originalFilters.some(
            (filter) => isDashboardDateFilter(filter) && dashboardFilterLocalIdentifier(filter) === undefined,
        )
    );
};

const removeDateFilterLocalIdentifier = (filter: FilterContextItem): FilterContextItem => {
    if (isDashboardDateFilter(filter)) {
        // oxlint-disable-next-line @typescript-eslint/no-unused-vars
        const { localIdentifier, ...rest } = filter.dateFilter;
        return {
            ...filter,
            dateFilter: {
                ...rest,
            },
        };
    }
    return filter;
};

const sanitizeFilters = (
    currentFilters: FilterContextItem[],
    originalFilters: FilterContextItem[],
    enableDateFilterIdentifiers: boolean,
): FilterContextItem[] => {
    const shouldRemoveIdentifiers = shouldIgnoreDateFilterLocalIdentifiers(
        enableDateFilterIdentifiers,
        originalFilters,
    );

    return shouldRemoveIdentifiers ? currentFilters.map(removeDateFilterLocalIdentifier) : currentFilters;
};

const getNewlyAddedFilterLocalIds = (
    currentFilters: FilterContextItem[],
    originalFilters: FilterContextItem[],
): string[] => {
    const originalAttributeFiltersLocalIds = originalFilters
        .filter(isDashboardAttributeFilter)
        .map((filter) => filter.attributeFilter.localIdentifier!);
    const currentFiltersLocalIds = currentFilters
        .filter(isDashboardAttributeFilter)
        .map((filter) => filter.attributeFilter.localIdentifier!);
    return difference(currentFiltersLocalIds, originalAttributeFiltersLocalIds);
};

const computeCanReset = (
    isEditMode: boolean,
    normalizedCurrentFilters: FilterContextItem[],
    normalizedOriginalFilters: FilterContextItem[],
    disableUserFilterReset: boolean,
    disableUserFilterResetByConfig: boolean,
    newlyAddedFiltersCount: number,
    isWorkingFilterContextChanged: boolean | undefined,
    isApplyAllAtOnceEnabledAndSet: boolean,
): boolean => {
    if (isEditMode) {
        return false;
    }

    const filtersChanged = !isEqual(normalizedCurrentFilters, normalizedOriginalFilters);
    const userFilterResetAllowed = !disableUserFilterReset && !disableUserFilterResetByConfig;
    const hasCrossFilterAddedFilters = newlyAddedFiltersCount > 0;
    // If the cross filter add some filters, we should allow the reset
    const canResetFromFilterChange = filtersChanged && (userFilterResetAllowed || hasCrossFilterAddedFilters);
    const canResetFromWorkingContext = !!isWorkingFilterContextChanged && isApplyAllAtOnceEnabledAndSet;

    return canResetFromFilterChange || canResetFromWorkingContext;
};

const isCrossFilteringEnabled = (
    enableKDCrossFiltering: boolean,
    supportsCrossFiltering: boolean,
    disableCrossFiltering: boolean,
    disableCrossFilteringByConfig: boolean,
): boolean => {
    return (
        enableKDCrossFiltering &&
        supportsCrossFiltering &&
        !disableCrossFiltering &&
        !disableCrossFilteringByConfig
    );
};

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
    const activeTabId = useDashboardSelector(selectActiveTabLocalIdentifier);

    const dispatch = useDashboardDispatch();
    const dispatchEvent = useDashboardEventDispatch();
    const { filterContextStateReset } = useDashboardUserInteraction();

    const newlyAddedFiltersLocalIds = useMemo(
        () => getNewlyAddedFilterLocalIds(currentFilters, originalFilters),
        [currentFilters, originalFilters],
    );

    const sanitizedCurrentFilters = useMemo(
        () => sanitizeFilters(currentFilters, originalFilters, enableDateFilterIdentifiers),
        [enableDateFilterIdentifiers, originalFilters, currentFilters],
    );

    // Normalize filters for comparison to handle "all time" common date filters consistently
    const normalizedCurrentFilters = useMemo(
        () => normalizeFiltersForComparison(sanitizedCurrentFilters),
        [sanitizedCurrentFilters],
    );

    const normalizedOriginalFilters = useMemo(
        () => normalizeFiltersForComparison(originalFilters),
        [originalFilters],
    );

    const canReset = useMemo(
        () =>
            computeCanReset(
                isEditMode,
                normalizedCurrentFilters,
                normalizedOriginalFilters,
                disableUserFilterReset,
                disableUserFilterResetByConfig,
                newlyAddedFiltersLocalIds.length,
                isWorkingFilterContextChanged,
                isApplyAllAtOnceEnabledAndSet,
            ),
        [
            isEditMode,
            normalizedCurrentFilters,
            normalizedOriginalFilters,
            disableUserFilterReset,
            disableUserFilterResetByConfig,
            newlyAddedFiltersLocalIds.length,
            isWorkingFilterContextChanged,
            isApplyAllAtOnceEnabledAndSet,
        ],
    );

    const crossFilteringEnabled = isCrossFilteringEnabled(
        enableKDCrossFiltering,
        supportsCrossFiltering,
        disableCrossFiltering,
        disableCrossFilteringByConfig,
    );

    const resetFilters = useCallback(() => {
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
        if (crossFilteringEnabled) {
            dispatch(removeAttributeFilters(newlyAddedFiltersLocalIds));
            dispatch(drillActions.resetCrossFiltering(activeTabId));
        }
        dispatchEvent(filterContextSelectionReset());
        // Report the reset as user interaction
        filterContextStateReset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        canReset,
        originalFilters,
        dispatch,
        crossFilteringEnabled,
        filterContextStateReset,
        newlyAddedFiltersLocalIds,
        disableUserFilterReset,
        enableDateFilterIdentifiers,
        isApplyAllAtOnceEnabledAndSet,
    ]);

    return {
        canReset,
        resetType: disableUserFilterReset ? "crossFilter" : "all",
        resetFilters,
    };
};
