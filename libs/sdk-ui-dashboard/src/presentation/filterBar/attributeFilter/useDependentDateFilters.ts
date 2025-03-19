// (C) 2024-2025 GoodData Corporation
import { useMemo } from "react";
import { invariant } from "ts-invariant";
import { IDashboardAttributeFilter, IDashboardDateFilter, objRefToString } from "@gooddata/sdk-model";

import {
    selectDashboardFiltersApplyMode,
    selectEnableDashboardFiltersApplyModes,
    selectFilterContextDateFilter,
    selectFilterContextDateFiltersWithDimension,
    selectWorkingFilterContextDateFilter,
    selectWorkingFilterContextDateFiltersWithDimension,
    useDashboardSelector,
} from "../../../model/index.js";
import { IAttributeFilterBaseProps } from "@gooddata/sdk-ui-filters";

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
 *
 * @beta
 */
export const useDependentDateFilters = (filter: IDashboardAttributeFilter): UseParentFiltersResult => {
    const enableDashboardFiltersApplyModes = useDashboardSelector(selectEnableDashboardFiltersApplyModes);
    const dashboardFiltersApplyMode = useDashboardSelector(selectDashboardFiltersApplyMode);

    const allAppliedDateFilters = useDashboardSelector(selectFilterContextDateFiltersWithDimension);
    const allWorkingDateFilters = useDashboardSelector(selectWorkingFilterContextDateFiltersWithDimension);
    const allDateFilters =
        dashboardFiltersApplyMode.mode === "ALL_AT_ONCE" && enableDashboardFiltersApplyModes
            ? allWorkingDateFilters
            : allAppliedDateFilters;

    const commonAppliedDateFilter = useDashboardSelector(selectFilterContextDateFilter);
    const commonWorkingDateFilter = useDashboardSelector(selectWorkingFilterContextDateFilter);
    const commonDateFilter =
        dashboardFiltersApplyMode.mode === "ALL_AT_ONCE" && enableDashboardFiltersApplyModes
            ? commonWorkingDateFilter
            : commonAppliedDateFilter;
    const commonDateFilterWithAllTime = getCommonDateFilterWithAllTime(commonDateFilter);

    const dependentDateFilters = useMemo(() => {
        return filter.attributeFilter.filterElementsByDate?.map((dependentDateFilter) => {
            if (dependentDateFilter.isCommonDate) {
                const commonDashboardDateFilter: IDashboardDateFilter = {
                    dateFilter: {
                        type: commonDateFilterWithAllTime?.dateFilter.type,
                        granularity: commonDateFilterWithAllTime?.dateFilter.granularity,
                        from: commonDateFilterWithAllTime?.dateFilter.from,
                        to: commonDateFilterWithAllTime?.dateFilter.to,
                        dataSet: {
                            identifier: dependentDateFilter.filterLocalIdentifier,
                            type: "dataSet",
                        },
                    },
                };

                return commonDashboardDateFilter;
            } else {
                const matchingFilter = allDateFilters.find(
                    (filter) =>
                        objRefToString(filter.dateFilter.dataSet!) ===
                        dependentDateFilter.filterLocalIdentifier,
                );

                invariant(matchingFilter); // if this blows up, the state is inconsistent

                return matchingFilter;
            }
        });
    }, [allDateFilters, commonDateFilterWithAllTime, filter.attributeFilter.filterElementsByDate]);

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
