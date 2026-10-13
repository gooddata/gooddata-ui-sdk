// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import {
    type DashboardAttributeFilterItem,
    type IDashboardAttributeFilterByDate,
    type IDashboardDateFilter,
    type ObjRef,
    dashboardAttributeFilterItemFilterElementsByDate,
    objRefToString,
} from "@gooddata/sdk-model";
import { type IAttributeFilterBaseProps } from "@gooddata/sdk-ui-filters";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
import {
    selectFilterContextDateFilter,
    selectFilterContextDateFilterForTab,
    selectFilterContextDateFiltersWithDimension,
    selectFilterContextDateFiltersWithDimensionForTab,
    selectWorkingFilterContextDateFilter,
    selectWorkingFilterContextDateFilterForTab,
    selectWorkingFilterContextDateFiltersWithDimension,
    selectWorkingFilterContextDateFiltersWithDimensionForTab,
} from "../../../model/store/tabs/filterContext/filterContextSelectors.js";

/**
 * Result of the {@link useDependentDateFilters} hook, that can be used as dependent date filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter}.
 *
 * @beta
 */
export type UseParentFiltersResult = Pick<IAttributeFilterBaseProps, "dependentDateFilters">;

/**
 * Returns depdent date filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter} for particular dashboard attribute filter.
 *
 * @param filter - dashboard filter to get the depdendent date filter-related data
 * @param tabId - optional tab identifier to read filter context from a specific tab instead of the active one
 *
 * @beta
 */
export const useDependentDateFilters = (
    filter: DashboardAttributeFilterItem,
    tabId?: string,
): UseParentFiltersResult => {
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);

    // Use tab-specific selectors when tabId is provided
    const allAppliedDateFilters = useDashboardSelector(
        tabId
            ? selectFilterContextDateFiltersWithDimensionForTab(tabId)
            : selectFilterContextDateFiltersWithDimension,
    );

    const allWorkingDateFilters = useDashboardSelector(
        tabId
            ? selectWorkingFilterContextDateFiltersWithDimensionForTab(tabId)
            : selectWorkingFilterContextDateFiltersWithDimension,
    );

    const allDateFilters = isApplyAllAtOnceEnabledAndSet ? allWorkingDateFilters : allAppliedDateFilters;

    // Use tab-specific selectors for common date filter when tabId is provided
    const commonAppliedDateFilter = useDashboardSelector(
        tabId ? selectFilterContextDateFilterForTab(tabId) : selectFilterContextDateFilter,
    );
    const commonWorkingDateFilter = useDashboardSelector(
        tabId ? selectWorkingFilterContextDateFilterForTab(tabId) : selectWorkingFilterContextDateFilter,
    );
    const commonDateFilter = isApplyAllAtOnceEnabledAndSet
        ? commonWorkingDateFilter
        : commonAppliedDateFilter;
    const commonDateFilterWithAllTime = getCommonDateFilterWithAllTime(commonDateFilter);

    const filterElementsByDate = dashboardAttributeFilterItemFilterElementsByDate(filter);

    const dependentDateFilters = useMemo(() => {
        return filterElementsByDate?.map((dependentDateFilter: IDashboardAttributeFilterByDate) => {
            if (dependentDateFilter.isCommonDate) {
                // The dimension to apply the common date range through.
                // New format: the explicit `dataSet` field (filterLocalIdentifier references the common
                // date filter itself). Legacy format: no `dataSet` field, so the dataset identifier was
                // stored directly in filterLocalIdentifier.
                const dataSet: ObjRef = dependentDateFilter.dataSet ?? {
                    identifier: dependentDateFilter.filterLocalIdentifier,
                    type: "dataSet",
                };

                const commonDashboardDateFilter: IDashboardDateFilter = {
                    dateFilter: {
                        type: commonDateFilterWithAllTime?.dateFilter.type,
                        granularity: commonDateFilterWithAllTime?.dateFilter.granularity,
                        from: commonDateFilterWithAllTime?.dateFilter.from,
                        to: commonDateFilterWithAllTime?.dateFilter.to,
                        dataSet,
                    },
                };

                return commonDashboardDateFilter;
            } else {
                // Try localIdentifier first (new format), then fall back to dataset identifier
                // (legacy format) for dashboards saved before the localIdentifier-based approach.
                // NOTE: If a filter's localIdentifier happens to equal another filter's dataset
                // identifier the wrong filter could be matched — this is an accepted theoretical
                // risk given the practical namespace separation between the two.
                const matchingFilter = allDateFilters.find(
                    (filter) =>
                        filter.dateFilter.localIdentifier === dependentDateFilter.filterLocalIdentifier ||
                        objRefToString(filter.dateFilter.dataSet!) ===
                            dependentDateFilter.filterLocalIdentifier,
                );

                invariant(matchingFilter); // if this blows up, the state is inconsistent

                return matchingFilter;
            }
        });
    }, [allDateFilters, commonDateFilterWithAllTime, filterElementsByDate]);

    return {
        dependentDateFilters,
    };
};

const getCommonDateFilterWithAllTime = (commonDate?: IDashboardDateFilter): IDashboardDateFilter => {
    if (commonDate) {
        return commonDate;
    } else {
        return {
            dateFilter: {
                granularity: "GDC.time.date",
                type: "relative",
            },
        };
    }
};
