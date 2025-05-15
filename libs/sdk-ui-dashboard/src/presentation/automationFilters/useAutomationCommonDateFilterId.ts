// (C) 2025 GoodData Corporation

import { isDashboardCommonDateFilter } from "@gooddata/sdk-model";
import { useAutomationAvailableDashboardFilters } from "../../model/index.js";

export const useAutomationCommonDateFilterId = () => {
    const availableDashboardFilters = useAutomationAvailableDashboardFilters();
    const commonDateFilter = availableDashboardFilters?.find(isDashboardCommonDateFilter);
    return commonDateFilter?.dateFilter.localIdentifier;
};
