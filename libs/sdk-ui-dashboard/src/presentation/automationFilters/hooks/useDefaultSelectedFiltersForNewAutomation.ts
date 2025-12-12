// (C) 2025 GoodData Corporation

import {
    type ExtendedDashboardWidget,
    removeIgnoredWidgetFilters,
    selectAutomationDefaultSelectedFilters,
    useDashboardSelector,
} from "../../../model/index.js";

export function useDefaultSelectedFiltersForNewAutomation(widget?: ExtendedDashboardWidget) {
    const availableDashboardFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    return removeIgnoredWidgetFilters(availableDashboardFilters, widget);
}
