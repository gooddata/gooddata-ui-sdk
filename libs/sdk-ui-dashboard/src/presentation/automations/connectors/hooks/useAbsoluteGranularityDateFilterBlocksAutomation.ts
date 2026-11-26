// (C) 2026 GoodData Corporation

import { isDashboardAbsoluteGranularityDateFilter } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import {
    selectFilterContextFilters,
    selectFiltersByTab,
} from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";

/**
 * Whether the filters the automation dialog would use contain an absolute date filter with granularity, which
 * automations do not support yet. A widget automation uses the active tab, a dashboard export any tab.
 *
 * @internal
 */
export function useAbsoluteGranularityDateFilterBlocksAutomation(isDashboardExport: boolean): boolean {
    const activeTabFilters = useDashboardSelector(selectFilterContextFilters);
    const filtersByTab = useDashboardSelector(selectFiltersByTab);
    const filters = isDashboardExport ? Object.values(filtersByTab).flat() : activeTabFilters;

    return filters.some(isDashboardAbsoluteGranularityDateFilter);
}
