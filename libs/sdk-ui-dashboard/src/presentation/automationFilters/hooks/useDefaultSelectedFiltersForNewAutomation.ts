// (C) 2025-2026 GoodData Corporation

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectAutomationDefaultSelectedFilters } from "../../../model/store/filtering/dashboardFilterSelectors.js";
import type { ExtendedDashboardWidget } from "../../../model/types/layoutTypes.js";
import { removeIgnoredWidgetFilters } from "../../../model/utils/widgetFilters.js";

export function useDefaultSelectedFiltersForNewAutomation(widget?: ExtendedDashboardWidget) {
    const availableDashboardFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    return removeIgnoredWidgetFilters(availableDashboardFilters, widget);
}
