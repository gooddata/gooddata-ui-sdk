// (C) 2025 GoodData Corporation

import { RefObject, useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
    isVisualizationSwitcherWidget,
    IWidget,
    objRefToString,
} from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";

import {
    selectDashboardUserAutomations,
    selectFocusObject,
    selectIsDashboardExecuted,
    selectIsInExportMode,
    selectWidgets,
    useDashboardSelector,
} from "../../../model/index.js";

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
            const isAutomationWidget =
                // alert widget
                matchedAutomation?.metadata?.widget === widget.identifier ||
                // schedule widget
                matchedAutomation?.exportDefinitions?.some(
                    (ed) =>
                        isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload) &&
                        isInsightWidget(widget) &&
                        ed.requestPayload.content.visualizationObject === objRefToString(widget.insight),
                );
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

const useOutsideClick = <T extends HTMLElement>(ref: RefObject<T | null>, callbackFn: () => void) => {
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

const MAX_RETRIES = 25;

export const useWidgetHighlighting = (widget: IWidget) => {
    const { automationId, widgetId, visualizationId } = useDashboardSelector(selectFocusObject);
    const isHighlighted = useDashboardSelector(selectIsWidgetHighlighted(widget));
    const [keepHighlight, setKeepHighlight] = useState(false);
    const [retries, update] = useReducer((x) => x + 1, 0);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // If we reach max retries, stop trying to scroll to the element
        if (retries >= MAX_RETRIES) {
            setKeepHighlight(false);
            return;
        }
        // If widget is highlighted and keepHighlight not yet set try to scroll
        if (isHighlighted && !keepHighlight) {
            // We only want to scroll to element when one context property is specified at a time
            const shouldScrollTo = [automationId, widgetId, visualizationId].filter(Boolean).length === 1;

            if (elementRef.current && shouldScrollTo) {
                const rect = elementRef.current?.getBoundingClientRect();
                // Element is not visible, do not scroll and try again
                if (rect?.width === 0 || rect?.height === 0) {
                    update();
                } else {
                    elementRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    setKeepHighlight(true);
                }
            }
        }
        // We intentionally exclude keepHighlight
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHighlighted, automationId, visualizationId, widgetId, retries]);

    // Remove highlight on outside click
    const removeHighlight = useCallback(() => setKeepHighlight(false), []);

    useOutsideClick(elementRef, removeHighlight);

    return {
        elementRef,
        highlighted: keepHighlight,
    };
};
