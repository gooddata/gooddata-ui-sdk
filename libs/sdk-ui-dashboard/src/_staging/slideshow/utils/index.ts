// (C) 2022-2025 GoodData Corporation
import { isDashboardLayout, isVisualizationSwitcherWidget } from "@gooddata/sdk-model";

/**
 * This function checks if the layout widget contains a visualization switcher somewhere in its structure.
 *
 * @param widget - widget to check
 */
export function containsVisualizationSwitcher<TWidget>(widget: TWidget) {
    if (!isDashboardLayout(widget)) {
        return false;
    }
    for (const section of widget.sections) {
        for (const item of section.items) {
            if (isDashboardLayout(item.widget)) {
                return containsVisualizationSwitcher(item.widget);
            } else if (isVisualizationSwitcherWidget(item.widget)) {
                return true;
            }
        }
    }
    return false;
}
