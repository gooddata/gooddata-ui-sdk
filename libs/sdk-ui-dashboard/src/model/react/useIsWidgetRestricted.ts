// (C) 2026 GoodData Corporation

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type ObjRef,
    areObjRefsEqual,
    isInsightWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import { collectReferences } from "@gooddata/sdk-ui-kit";

import { type ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import {
    selectRestrictedInsightsMap,
    selectRestrictedRichTextReferences,
} from "../store/unavailableObjects/unavailableObjectsSelectors.js";
import { type ExtendedDashboardWidget, isExtendedDashboardLayoutWidget } from "../types/layoutTypes.js";

import { useDashboardSelector } from "./DashboardStoreProvider.js";

/**
 * A switcher counts as restricted as soon as one of its entries is: its size comes from a
 * visualization type the editor may not read, exactly as for a single restricted visualization. A
 * rich text widget counts once its text references an object that is withheld, and a container once
 * anything inside it does, because its own resize reaches every descendant.
 */
function isWidgetRestricted(
    widget: ExtendedDashboardWidget,
    restrictedInsights: ObjRefMap<IUnavailableDashboardReference>,
    restrictedReferences: ObjRef[],
): boolean {
    if (isInsightWidget(widget)) {
        return restrictedInsights.has(widget.insight);
    }
    if (isVisualizationSwitcherWidget(widget)) {
        return widget.visualizations.some((visualization) => restrictedInsights.has(visualization.insight));
    }
    if (isRichTextWidget(widget)) {
        return Object.values(collectReferences(widget.content)).some((reference) =>
            restrictedReferences.some((restricted) => areObjRefsEqual(restricted, reference.ref)),
        );
    }
    if (isExtendedDashboardLayoutWidget(widget)) {
        // resizing a container writes its new width to every widget inside it, so a container holding
        // a restricted widget cannot be resized either
        return widget.sections.some((section) =>
            section.items.some(
                (item) =>
                    item.widget && isWidgetRestricted(item.widget, restrictedInsights, restrictedReferences),
            ),
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
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);

    return isWidgetRestricted(widget, restrictedInsights, restrictedReferences);
}

/**
 * Tells whether any of the widgets is restricted. Used where an action covers several widgets at once,
 * such as the height resizer, which resizes a whole row.
 *
 * @internal
 */
export function useIsAnyWidgetRestricted(widgets: ExtendedDashboardWidget[]): boolean {
    const restrictedInsights = useDashboardSelector(selectRestrictedInsightsMap);
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);

    return widgets.some((widget) => isWidgetRestricted(widget, restrictedInsights, restrictedReferences));
}
