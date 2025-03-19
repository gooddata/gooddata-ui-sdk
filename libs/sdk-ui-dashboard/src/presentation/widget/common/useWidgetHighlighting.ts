// (C) 2025 GoodData Corporation

import { isInsightWidget, isVisualizationSwitcherWidget, IWidget, objRefToString } from "@gooddata/sdk-model";
import {
    selectDashboardUserAutomations,
    selectFocusObject,
    selectIsDashboardExecuted,
    selectIsInExportMode,
    selectWidgets,
    useDashboardSelector,
} from "../../../model/index.js";
import { createSelector } from "@reduxjs/toolkit";
import { useCallback, useEffect, useRef, useState } from "react";

const selectIsWidgetHighlighted = (widget: IWidget) =>
    createSelector(
        selectFocusObject,
        selectDashboardUserAutomations,
        selectIsDashboardExecuted,
        selectWidgets,
        selectIsInExportMode,
        (dashboardFocusObject, automations, dashboardExecuted, widgets, isInExportMode) => {
            if (isInExportMode) {
                return false;
            }

            const { automationId, widgetId, visualizationId } = dashboardFocusObject;

            const matchedAutomation = automations?.find((a) => a.id === automationId);
            const isAutomationWidget = matchedAutomation?.metadata?.widget === widget.identifier;
            const isAutomationVisualizationSwitcher =
                isVisualizationSwitcherWidget(widget) &&
                widget.visualizations.some((v) => v.identifier === matchedAutomation?.metadata?.widget);
            const isAutomationContext = isAutomationWidget || isAutomationVisualizationSwitcher;

            const isCurrentWidget = widget.identifier === widgetId;
            const isWidgetInsideVisualizationSwitcher =
                isVisualizationSwitcherWidget(widget) &&
                widget.visualizations.some((v) => v.identifier === widgetId);
            const isWidgetContext = isCurrentWidget || isWidgetInsideVisualizationSwitcher;

            // Specific visualization may be repeatedly found in widgets, so we only take the first one
            const firstWidgetWithVisualization = widgets.find((w) => {
                if (isInsightWidget(w)) {
                    return objRefToString(w.insight) === visualizationId;
                } else if (isVisualizationSwitcherWidget(w)) {
                    return w.visualizations.some((v) => objRefToString(v.insight) === visualizationId);
                } else {
                    return false;
                }
            });
            const isVisualizationContext =
                visualizationId && firstWidgetWithVisualization?.identifier === widget.identifier;

            // Do not highlight widget if dashboard is already executed to avoid repeating event when switching dashboard modes
            return !dashboardExecuted && (isAutomationContext || isWidgetContext || isVisualizationContext);
        },
    );

const useOutsideClick = <T extends HTMLElement>(ref: React.RefObject<T>, callbackFn: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callbackFn();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callbackFn]);
};

export const useWidgetHighlighting = (widget: IWidget) => {
    const { automationId, widgetId, visualizationId } = useDashboardSelector(selectFocusObject);
    const isHighlighted = useDashboardSelector(selectIsWidgetHighlighted(widget));
    const [keepHighlight, setKeepHighlight] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isHighlighted && !keepHighlight) {
            // We only want to scroll to element when one context property is specified at a time
            const shouldScrollTo = [automationId, widgetId, visualizationId].filter(Boolean).length === 1;

            if (elementRef.current && shouldScrollTo) {
                elementRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            setKeepHighlight(true);
        }
        // We intentionally exclude keepHighlight
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHighlighted, automationId, visualizationId, widgetId]);

    // Remove highlight on outside click
    const removeHighlight = useCallback(() => setKeepHighlight(false), []);

    useOutsideClick(elementRef, removeHighlight);

    return {
        elementRef,
        highlighted: keepHighlight,
    };
};
