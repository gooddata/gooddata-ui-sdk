// (C) 2019-2025 GoodData Corporation
import { useMemo } from "react";
import { selectEnableAutomationFilterContext } from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { FilterContextItem, isDashboardAttributeFilter, isDashboardDateFilter } from "@gooddata/sdk-model";
import { selectDashboardFiltersWithoutCrossFiltering } from "../filtering/selectors.js";

export const getFilterLocalIdentifier = (filter: FilterContextItem): string | undefined => {
    if (isDashboardAttributeFilter(filter)) {
        return filter.attributeFilter.localIdentifier;
    } else if (isDashboardDateFilter(filter)) {
        return filter.dateFilter.localIdentifier;
    }
    return undefined;
};

export const validateAllFilterLocalIdentifiers = (filters: FilterContextItem[]): boolean => {
    return filters.every((filter) => getFilterLocalIdentifier(filter) !== undefined);
};

/**
 * @internal
 */
export const useEnableAlertingAutomationFilterContext = () => {
    const filters = useDashboardSelector(selectDashboardFiltersWithoutCrossFiltering);
    const enableAutomationFilterContextFlag = useDashboardSelector(selectEnableAutomationFilterContext);

    return useMemo(() => {
        const doAllFiltersHaveLocalIdentifiers = validateAllFilterLocalIdentifiers(filters ?? []);
        return enableAutomationFilterContextFlag && doAllFiltersHaveLocalIdentifiers;
    }, [filters, enableAutomationFilterContextFlag]);
};
