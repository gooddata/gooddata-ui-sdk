// (C) 2019-2026 GoodData Corporation

import { useMemo } from "react";

import {
    type FilterContextItem,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-model";

import { selectEnableAutomationFilterContext } from "../../store/config/configSelectors.js";
import { selectDashboardFiltersWithoutCrossFiltering } from "../../store/filtering/dashboardFilterSelectors.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";

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
