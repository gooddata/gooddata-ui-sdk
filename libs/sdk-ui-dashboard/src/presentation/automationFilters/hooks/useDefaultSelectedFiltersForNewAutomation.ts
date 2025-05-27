// (C) 2025 GoodData Corporation
import {
    ExtendedDashboardWidget,
    useDashboardSelector,
    selectAutomationAvailableDashboardFilters,
} from "../../../model/index.js";
import { removeIgnoredWidgetFilters } from "../utils.js";

export function useDefaultSelectedFiltersForNewAutomation(widget?: ExtendedDashboardWidget) {
    const availableDashboardFilters = useDashboardSelector(selectAutomationAvailableDashboardFilters);
    return removeIgnoredWidgetFilters(availableDashboardFilters, widget);
}
