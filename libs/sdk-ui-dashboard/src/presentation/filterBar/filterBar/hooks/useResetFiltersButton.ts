// (C) 2023-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { difference, isEqual, partition } from "lodash-es";

import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
import {
    type FilterContextItem,
    type IDashboardDateFilter,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    isDashboardAttributeFilterItem,
    isDashboardCommonDateFilter,
    isDashboardDateFilter,
    isDashboardMeasureValueFilter,
    isNoopAllTimeDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../locales.js";
import {
    changeFilterContextSelection,
    removeAttributeFilters,
    resetFilterContextWorkingSelection,
} from "../../../../model/commands/filters.js";
import { filterContextSelectionReset } from "../../../../model/events/filters.js";
import { parametersSelectionReset } from "../../../../model/events/parameters.js";
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
import { tabsActions } from "../../../../model/store/tabs/index.js";
import { selectActiveTabParameterResetTargets } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../../../model/store/tabs/tabsSelectors.js";

const isNoopAllTimeCommonDateFilter = (filter: FilterContextItem): boolean => {
    return isDashboardCommonDateFilter(filter) && isNoopAllTimeDashboardDateFilter(filter);
};

const isNoopMeasureValueFilter = (filter: FilterContextItem): boolean => {
    return isDashboardMeasureValueFilter(filter) && !filter.dashboardMeasureValueFilter.conditions?.length;
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
            ...(from == null ? {} : { from }),
            ...(to == null ? {} : { to }),
        } as IDashboardDateFilter["dateFilter"],
    };
};

const normalizeFilterForComparison = (filter: FilterContextItem): FilterContextItem => {
    return isDashboardDateFilter(filter) ? normalizeDateFilterForComparison(filter) : filter;
};

const normalizeFiltersForComparison = (filters: FilterContextItem[]): FilterContextItem[] => {
    const normalized = filters.map(normalizeFilterForComparison);

    // Remove no-op filters to normalize the reset comparison.
    return normalized.filter((filter) => {
        return !isNoopAllTimeCommonDateFilter(filter) && !isNoopMeasureValueFilter(filter);
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
        .filter(isDashboardAttributeFilterItem)
        .map((filter) => dashboardAttributeFilterItemLocalIdentifier(filter)!);
    const currentFiltersLocalIds = currentFilters
        .filter(isDashboardAttributeFilterItem)
        .map((filter) => dashboardAttributeFilterItemLocalIdentifier(filter)!);
    return difference(currentFiltersLocalIds, originalAttributeFiltersLocalIds);
};

interface IResetEligibility {
    readonly canResetFilters: boolean;
    readonly canResetWorkingContext: boolean;
    readonly canResetParameters: boolean;
}

const computeResetEligibility = (
    isEditMode: boolean,
    normalizedCurrentFilters: FilterContextItem[],
    normalizedOriginalFilters: FilterContextItem[],
    userFilterResetAllowed: boolean,
    newlyAddedFiltersCount: number,
    isWorkingFilterContextChanged: boolean | undefined,
    isApplyAllAtOnceEnabledAndSet: boolean,
    hasResettableParameter: boolean,
): IResetEligibility => {
    if (isEditMode) {
        return { canResetFilters: false, canResetWorkingContext: false, canResetParameters: false };
    }

    const filtersChanged = !isEqual(normalizedCurrentFilters, normalizedOriginalFilters);
    const hasCrossFilterAddedFilters = newlyAddedFiltersCount > 0;
    // If the cross filter add some filters, we should allow the reset
    return {
        canResetFilters: filtersChanged && (userFilterResetAllowed || hasCrossFilterAddedFilters),
        canResetWorkingContext: !!isWorkingFilterContextChanged && isApplyAllAtOnceEnabledAndSet,
        canResetParameters: hasResettableParameter && userFilterResetAllowed,
    };
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
    const parameterResetTargets = useDashboardSelector(selectActiveTabParameterResetTargets);
    const hasResettableParameter = parameterResetTargets.length > 0;
    const userFilterResetAllowed = !disableUserFilterReset && !disableUserFilterResetByConfig;

    const dispatch = useDashboardDispatch();
    const dispatchEvent = useDashboardEventDispatch();
    const { filterContextStateReset, parametersStateReset } = useDashboardUserInteraction();
    const { addSuccess } = useToastMessage();

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

    const { canResetFilters, canResetWorkingContext, canResetParameters } = useMemo(
        () =>
            computeResetEligibility(
                isEditMode,
                normalizedCurrentFilters,
                normalizedOriginalFilters,
                userFilterResetAllowed,
                newlyAddedFiltersLocalIds.length,
                isWorkingFilterContextChanged,
                isApplyAllAtOnceEnabledAndSet,
                hasResettableParameter,
            ),
        [
            isEditMode,
            normalizedCurrentFilters,
            normalizedOriginalFilters,
            userFilterResetAllowed,
            newlyAddedFiltersLocalIds.length,
            isWorkingFilterContextChanged,
            isApplyAllAtOnceEnabledAndSet,
            hasResettableParameter,
        ],
    );
    const canReset = canResetFilters || canResetWorkingContext || canResetParameters;

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

        const willResetFilterContext = canResetFilters || canResetWorkingContext;

        // If the user filter reset is disabled (by dashboard prop OR workspace config),
        // keep user-modified filters; only the cross-filter cleanup branch runs below.
        if (willResetFilterContext && userFilterResetAllowed) {
            // Normalize filters to include "All time" date filter
            const [[commonDateFilter], otherFilters] = partition(
                originalFilters,
                isDashboardCommonDateFilter,
            ) as [IDashboardDateFilter[], FilterContextItem[]];

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
        if (willResetFilterContext && crossFilteringEnabled) {
            dispatch(removeAttributeFilters(newlyAddedFiltersLocalIds));
            dispatch(drillActions.resetCrossFiltering(activeTabId));
        }

        if (canResetParameters) {
            dispatch(tabsActions.setParameterRuntimeValues({ values: parameterResetTargets }));
            dispatchEvent(parametersSelectionReset());
            parametersStateReset();
        }

        // Filter-context event and telemetry must only fire when filter-side work actually ran,
        // so plugins/analytics don't observe a filter reset on a parameter-only click.
        if (willResetFilterContext) {
            dispatchEvent(filterContextSelectionReset());
            filterContextStateReset();
        }

        addSuccess(messages.filterResetButtonSuccess);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        canReset,
        canResetFilters,
        canResetWorkingContext,
        canResetParameters,
        parameterResetTargets,
        originalFilters,
        dispatch,
        crossFilteringEnabled,
        filterContextStateReset,
        parametersStateReset,
        newlyAddedFiltersLocalIds,
        userFilterResetAllowed,
        enableDateFilterIdentifiers,
        isApplyAllAtOnceEnabledAndSet,
        addSuccess,
    ]);

    return {
        canReset,
        resetType: userFilterResetAllowed ? "all" : "crossFilter",
        resetFilters,
    };
};
