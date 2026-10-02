// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAnalyticalWidget,
    type IDashboardAttributeFilterConfig,
    type IDashboardLayout,
    type IDashboardLayoutSection,
    type IInsight,
    type IInsightWidget,
    type ObjRef,
    type ObjectType,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    insightRef,
    isComputedAttributeRef,
    isDashboardAttributeFilterItem,
    isDashboardAttributeFilterReference,
    isDrillToDashboard,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import { collectReferences } from "@gooddata/sdk-ui-kit";

import { type ExtendedDashboardWidget, isExtendedDashboardLayoutWidget } from "../../types/layoutTypes.js";
import { isDashboardObjectRestricted } from "../filtering/restrictedFilterUtils.js";
import { selectInsights } from "../insights/insightsSelectors.js";
import { selectIsInViewMode } from "../renderMode/renderModeSelectors.js";
import { selectTabs } from "../tabs/tabsSelectors.js";
import { type DashboardSelector } from "../types.js";
import { isDrillRestricted } from "../widgetDrills/drillRestrictionUtils.js";

import { selectUnavailableObjects } from "./unavailableObjectsSelectors.js";

/**
 * The parts of one dashboard tab a copy of the dashboard is created from.
 *
 * @internal
 */
export interface IDashboardCopySourceTab {
    layout?: IDashboardLayout<ExtendedDashboardWidget>;
    filters: FilterContextItem[];
    attributeFilterConfigs: IDashboardAttributeFilterConfig[];
}

/**
 * Tells whether a copy of the dashboard would reference an object the current user may not read in a
 * place the backend checks when it creates the copy, so it would refuse the copy.
 *
 * @remarks
 * The backend accepts a copy that keeps a drill to a dashboard the user cannot open, an ignored
 * drill-down hierarchy, or a metric the user may not read in a measure value filter or in the
 * limit of a filter's values, so none of these count. A merely deleted object does not count either.
 *
 * @internal
 */
export function hasCopyBlockingReference(
    tabs: IDashboardCopySourceTab[],
    insights: IInsight[],
    unavailableObjects: IUnavailableDashboardReference[],
): boolean {
    const isForbidden = (ref: ObjRef | undefined, type: ObjectType) =>
        ref !== undefined && isDashboardObjectRestricted(ref, type, unavailableObjects);

    const isLabelForbidden = (ref: ObjRef | undefined) =>
        ref !== undefined &&
        isForbidden(ref, isComputedAttributeRef(ref) ? "computedAttribute" : "displayForm");

    const isTextForbidden = (text: string | undefined) =>
        Object.values(collectReferences(text ?? "")).some(({ ref, type }) => isForbidden(ref, type));

    const isAnalyticalWidgetForbidden = (widget: IAnalyticalWidget) =>
        isTextForbidden(widget.description) ||
        widget.ignoreDashboardFilters.some(
            (reference) =>
                isDashboardAttributeFilterReference(reference) && isLabelForbidden(reference.displayForm),
        );

    const isInsightWidgetForbidden = (widget: IInsightWidget) => {
        // Save as new recomputes custom URL references from the insight as it is now, so resolve them the same way
        const insight = insights.find((candidate) => areObjRefsEqual(insightRef(candidate), widget.insight));
        return (
            isAnalyticalWidgetForbidden(widget) ||
            isForbidden(widget.insight, "insight") ||
            widget.drills.some(
                (drill) =>
                    !isDrillToDashboard(drill) && isDrillRestricted(drill, unavailableObjects, insight),
            )
        );
    };

    const isWidgetForbidden = (widget: ExtendedDashboardWidget): boolean => {
        if (isExtendedDashboardLayoutWidget(widget)) {
            return widget.sections.some(isSectionForbidden);
        }
        if (isInsightWidget(widget)) {
            return isInsightWidgetForbidden(widget);
        }
        if (isVisualizationSwitcherWidget(widget)) {
            return (
                isAnalyticalWidgetForbidden(widget) || widget.visualizations.some(isInsightWidgetForbidden)
            );
        }
        if (isKpiWidget(widget)) {
            return isAnalyticalWidgetForbidden(widget) || isForbidden(widget.kpi.metric, "measure");
        }
        if (isRichTextWidget(widget)) {
            return isAnalyticalWidgetForbidden(widget) || isTextForbidden(widget.content);
        }
        return false;
    };

    const isSectionForbidden = (section: IDashboardLayoutSection<ExtendedDashboardWidget>): boolean =>
        isTextForbidden(section.header?.description) ||
        section.items.some((item) => item.widget !== undefined && isWidgetForbidden(item.widget));

    return tabs.some(
        (tab) =>
            (tab.layout?.sections ?? []).some(isSectionForbidden) ||
            tab.attributeFilterConfigs.some((config) => isLabelForbidden(config.displayAsLabel)) ||
            tab.filters.some(
                (filter) =>
                    isDashboardAttributeFilterItem(filter) &&
                    isLabelForbidden(dashboardAttributeFilterItemDisplayForm(filter)),
            ),
    );
}

/**
 * Selects whether "Save as new" would fail because the dashboard, as it stands now, references objects
 * the current user may not read in places the backend refuses to copy. Removing those references in
 * edit mode clears it. The copy is made from every tab, and in view mode from the saved filters.
 *
 * @internal
 */
export const selectHasCopyBlockingReferences: DashboardSelector<boolean> = createSelector(
    selectTabs,
    selectInsights,
    selectIsInViewMode,
    selectUnavailableObjects,
    (tabs, insights, isInViewMode, unavailableObjects) =>
        unavailableObjects.length > 0 &&
        hasCopyBlockingReference(
            (tabs ?? []).map((tab) => {
                const filterContext = isInViewMode
                    ? tab.filterContext?.originalFilterContextDefinition
                    : tab.filterContext?.filterContextDefinition;
                return {
                    layout: tab.layout?.layout,
                    filters: filterContext?.filters ?? [],
                    attributeFilterConfigs: tab.attributeFilterConfigs?.attributeFilterConfigs ?? [],
                };
            }),
            insights,
            unavailableObjects,
        ),
);
