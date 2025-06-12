// (C) 2025 GoodData Corporation
import {
    ExtendedDashboardWidget,
    useDashboardSelector,
    selectAutomationDefaultSelectedFilters,
} from "../../../model/index.js";
import { removeIgnoredWidgetFilters } from "../utils.js";

export function useDefaultSelectedFiltersForNewAutomation(widget?: ExtendedDashboardWidget) {
    const availableDashboardFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    return removeIgnoredWidgetFilters(availableDashboardFilters, widget);
}
