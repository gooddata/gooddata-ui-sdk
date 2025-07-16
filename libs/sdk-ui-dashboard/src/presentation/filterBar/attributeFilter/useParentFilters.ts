// (C) 2021-2025 GoodData Corporation
import { useMemo } from "react";
import { invariant } from "ts-invariant";
import { IAttributeFilter, ObjRef, IDashboardAttributeFilter } from "@gooddata/sdk-model";

import { dashboardAttributeFilterToAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import {
    selectFilterContextAttributeFilters,
    selectSupportsSettingConnectingAttributes,
    selectWorkingFilterContextAttributeFilters,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    useDashboardSelector,
} from "../../../model/index.js";
import { IAttributeFilterBaseProps } from "@gooddata/sdk-ui-filters";

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
 *
 * @public
 */
export const useParentFilters = (filter: IDashboardAttributeFilter): UseParentFiltersResult => {
    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);
    const allAppliedAttributeFilters = useDashboardSelector(selectFilterContextAttributeFilters);
    const allWorkingAttributeFilters = useDashboardSelector(selectWorkingFilterContextAttributeFilters);
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

        return (_parentFilter: IAttributeFilter, index: number): ObjRef => parentFiltersData[index].over!;
    }, [parentFiltersData, supportsSettingConnectingAttributes]);

    return {
        parentFilters,
        parentFilterOverAttribute: parentOverLookup,
    };
};
