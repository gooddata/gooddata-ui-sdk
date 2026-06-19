// (C) 2025-2026 GoodData Corporation

import { type ExtendedDashboardWidget } from "../../../../../model/types/layoutTypes.js";
import { removeIgnoredWidgetFilters } from "../../../../../model/utils/widgetFilters.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";

export function useDefaultSelectedFiltersForNewAutomation(widget?: ExtendedDashboardWidget) {
    const { defaultSelectedFilters } = useAutomationsContext();
    return removeIgnoredWidgetFilters(defaultSelectedFilters, widget);
}
