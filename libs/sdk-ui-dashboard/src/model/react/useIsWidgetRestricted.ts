// (C) 2026 GoodData Corporation

import { isInsightWidget } from "@gooddata/sdk-model";

import { selectRestrictedInsightsMap } from "../store/unavailableObjects/unavailableObjectsSelectors.js";
import { type ExtendedDashboardWidget } from "../types/layoutTypes.js";

import { useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * Tells whether the widget renders an insight the current user is not allowed to see. A widget whose
 * insight is merely deleted is not restricted — that one keeps rendering the missing-visualization tile.
 *
 * @alpha
 */
export function useIsWidgetRestricted(widget: ExtendedDashboardWidget): boolean {
    const restrictedInsights = useDashboardSelector(selectRestrictedInsightsMap);

    return isInsightWidget(widget) && restrictedInsights.has(widget.insight);
}
