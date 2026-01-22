// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { invariant } from "ts-invariant";

import { type IAttributeFilter, type IDashboardAttributeFilter, type ObjRef } from "@gooddata/sdk-model";
import { type IAttributeFilterBaseProps } from "@gooddata/sdk-ui-filters";

import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSupportsSettingConnectingAttributes } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextAttributeFiltersForTab,
    selectWorkingFilterContextAttributeFilters,
    selectWorkingFilterContextAttributeFiltersForTab,
} from "../../../model/store/tabs/filterContext/filterContextSelectors.js";

/**
 * Result of the {@link useParentFilters} hook, that can be used as parent filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter}.
 *
 * @public
 */
export type UseParentFiltersResult = Pick<
    IAttributeFilterBaseProps,
    "parentFilters" | "parentFilterOverAttribute"
>;

/**
 * Returns parent filtering input props for {@link @gooddata/sdk-ui-filters#AttributeFilter} for particular dashboard attribute filter.
 *
 * @param filter - dashboard filter to get the parent filter-related data
 * @param tabId - optional tab identifier to read filter context from a specific tab instead of the active one
 *
 * @public
 */
export const useParentFilters = (
    filter: IDashboardAttributeFilter,
    tabId?: string,
): UseParentFiltersResult => {
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);

    // Use tab-specific selectors when tabId is provided
    const allAppliedAttributeFilters = useDashboardSelector(
        tabId ? selectFilterContextAttributeFiltersForTab(tabId) : selectFilterContextAttributeFilters,
    );

    const allWorkingAttributeFilters = useDashboardSelector(
        tabId
            ? selectWorkingFilterContextAttributeFiltersForTab(tabId)
            : selectWorkingFilterContextAttributeFilters,
    );

    const allAttributeFilters = isApplyAllAtOnceEnabledAndSet
        ? allWorkingAttributeFilters
        : allAppliedAttributeFilters;
    const supportsSettingConnectingAttributes = useDashboardSelector(
        selectSupportsSettingConnectingAttributes,
    );

    const parentFiltersData = useMemo(() => {
        return filter.attributeFilter.filterElementsBy?.map((parent) => {
            const matchingFilter = allAttributeFilters.find(
                (filter) => filter.attributeFilter.localIdentifier === parent.filterLocalIdentifier,
            );

            invariant(matchingFilter); // if this blows up, the state is inconsistent

            return { filter: matchingFilter, over: parent.over.attributes[0] };
        });
    }, [allAttributeFilters, filter.attributeFilter.filterElementsBy]);

    const parentFilters = useMemo(() => {
        return parentFiltersData?.map((item) => dashboardAttributeFilterToAttributeFilter(item.filter));
    }, [parentFiltersData]);

    const parentOverLookup = useMemo(() => {
        // no parents -> no need for the lookup function
        // no support for connecting attributes -> no need for the lookup function
        if (!parentFiltersData || !supportsSettingConnectingAttributes) {
            return undefined;
        }

        return (_parentFilter: IAttributeFilter, index: number): ObjRef => parentFiltersData[index].over;
    }, [parentFiltersData, supportsSettingConnectingAttributes]);

    return {
        parentFilters,
        parentFilterOverAttribute: parentOverLookup,
    };
};
