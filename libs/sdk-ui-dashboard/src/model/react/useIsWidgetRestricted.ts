// (C) 2026 GoodData Corporation

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { isInsightWidget, isVisualizationSwitcherWidget } from "@gooddata/sdk-model";

import { type ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { selectRestrictedInsightsMap } from "../store/unavailableObjects/unavailableObjectsSelectors.js";
import { type ExtendedDashboardWidget, isExtendedDashboardLayoutWidget } from "../types/layoutTypes.js";

import { useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * A switcher counts as restricted as soon as one of its entries is: its size comes from a
 * visualization type the editor may not read, exactly as for a single restricted visualization. A
 * container counts once anything inside it does, because its own resize reaches every descendant.
 */
function isWidgetRestricted(
    widget: ExtendedDashboardWidget,
    restrictedInsights: ObjRefMap<IUnavailableDashboardReference>,
): boolean {
    if (isInsightWidget(widget)) {
        return restrictedInsights.has(widget.insight);
    }
    if (isVisualizationSwitcherWidget(widget)) {
        return widget.visualizations.some((visualization) => restrictedInsights.has(visualization.insight));
    }
    if (isExtendedDashboardLayoutWidget(widget)) {
        // resizing a container writes its new width to every widget inside it, so a container holding
        // a restricted widget cannot be resized either
        return widget.sections.some((section) =>
            section.items.some((item) => item.widget && isWidgetRestricted(item.widget, restrictedInsights)),
        );
    }
    return false;
}

/**
 * Tells whether the widget renders something the current user is not allowed to see. A widget whose
 * insight is merely deleted is not restricted — that one keeps rendering the missing-visualization tile.
 *
 * @alpha
 */
export function useIsWidgetRestricted(widget: ExtendedDashboardWidget): boolean {
    const restrictedInsights = useDashboardSelector(selectRestrictedInsightsMap);

    return isWidgetRestricted(widget, restrictedInsights);
}

/**
 * Tells whether any of the widgets is restricted. Used where an action covers several widgets at once,
 * such as the height resizer, which resizes a whole row.
 *
 * @internal
 */
export function useIsAnyWidgetRestricted(widgets: ExtendedDashboardWidget[]): boolean {
    const restrictedInsights = useDashboardSelector(selectRestrictedInsightsMap);

    return widgets.some((widget) => isWidgetRestricted(widget, restrictedInsights));
}
