// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import {
    type IInsightWidget,
    type ObjRef,
    areObjRefsEqual,
    isInsightWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { collectReferences } from "@gooddata/sdk-ui-kit";

import { selectWidgetsWithRestrictedData } from "../store/restrictedData/restrictedDataSelectors.js";
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
    isInsightWidgetRestricted: (widget: IInsightWidget) => boolean,
    restrictedReferences: ObjRef[],
): boolean {
    if (isInsightWidget(widget)) {
        return isInsightWidgetRestricted(widget);
    }
    if (isVisualizationSwitcherWidget(widget)) {
        return widget.visualizations.some(isInsightWidgetRestricted);
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
                    item.widget &&
                    isWidgetRestricted(item.widget, isInsightWidgetRestricted, restrictedReferences),
            ),
        );
    }
    return false;
}

/**
 * Returns the check whether an insight widget renders as restricted: its insight is one the current
 * user is not allowed to read, or its execution was refused because the user may not read some of
 * the data. The design makes no difference between the two; the second is known only once the
 * widget has executed.
 *
 * @internal
 */
export function useIsInsightWidgetRestricted(): (widget: IInsightWidget) => boolean {
    const restrictedInsights = useDashboardSelector(selectRestrictedInsightsMap);
    const widgetsWithRestrictedData = useDashboardSelector(selectWidgetsWithRestrictedData);

    return useCallback(
        (widget: IInsightWidget) =>
            restrictedInsights.has(widget.insight) ||
            widgetsWithRestrictedData.has(serializeObjRef(widget.ref)),
        [restrictedInsights, widgetsWithRestrictedData],
    );
}

/**
 * Tells whether the widget renders something the current user is not allowed to see. A widget whose
 * insight is merely deleted is not restricted — that one keeps rendering the missing-visualization tile.
 *
 * @alpha
 */
export function useIsWidgetRestricted(widget: ExtendedDashboardWidget): boolean {
    const isInsightWidgetRestricted = useIsInsightWidgetRestricted();
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);

    return isWidgetRestricted(widget, isInsightWidgetRestricted, restrictedReferences);
}

/**
 * Tells whether any of the widgets is restricted. Used where an action covers several widgets at once,
 * such as the height resizer, which resizes a whole row.
 *
 * @internal
 */
export function useIsAnyWidgetRestricted(widgets: ExtendedDashboardWidget[]): boolean {
    const isInsightWidgetRestricted = useIsInsightWidgetRestricted();
    const restrictedReferences = useDashboardSelector(selectRestrictedRichTextReferences);

    return widgets.some((widget) =>
        isWidgetRestricted(widget, isInsightWidgetRestricted, restrictedReferences),
    );
}
