// (C) 2019-2026 GoodData Corporation

import { useMemo } from "react";

import { type FilterContextItem, dashboardFilterLocalIdentifier } from "@gooddata/sdk-model";

import { selectEnableAutomationFilterContext } from "../../store/config/configSelectors.js";
import { selectDashboardFiltersWithoutCrossFiltering } from "../../store/filtering/dashboardFilterSelectors.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";

const validateAllFilterLocalIdentifiers = (filters: FilterContextItem[]): boolean => {
    return filters.every((filter) => dashboardFilterLocalIdentifier(filter) !== undefined);
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
