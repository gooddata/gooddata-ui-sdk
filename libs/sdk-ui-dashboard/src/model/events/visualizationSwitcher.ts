// (C) 2024 GoodData Corporation

import { IInsightWidget, ObjRef } from "@gooddata/sdk-model";
import { IDashboardEvent } from "./base.js";
import { DashboardContext } from "../types/commonTypes.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardVisualizationSwitcherWidgetVisualizationAdded} event.
 * @beta
 */
export interface DashboardVisualizationSwitcherWidgetVisualizationAddedPayload {
    /**
     * Reference to changed visualization switcher widget.
     */
    readonly ref: ObjRef;
    /**
     * Visualization to add onto switcher widget.
     */
    readonly visualization: IInsightWidget;
}
/**
 * This event is emitted when the new visualization is added to the dashboard's visualization switcher widget.
 *
 * @beta
 */
export interface DashboardVisualizationSwitcherWidgetVisualizationAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATION_ADDED";
    readonly payload: DashboardVisualizationSwitcherWidgetVisualizationAddedPayload;
}

/**
 * @internal
 */
export function visualizationSwitcherWidgetVisualizationAdded(
    ctx: DashboardContext,
    ref: ObjRef,
    visualization: IInsightWidget,
    correlationId?: string,
): DashboardVisualizationSwitcherWidgetVisualizationAdded {
    return {
        type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATION_ADDED",
        ctx,
        correlationId,
        payload: {
            ref,
            visualization,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardVisualizationSwitcherWidgetVisualizationAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardVisualizationSwitcherWidgetVisualizationAdded =
    eventGuard<DashboardVisualizationSwitcherWidgetVisualizationAdded>(
        "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATION_ADDED",
    );

/**
 * Payload of the {@link DashboardVisualizationSwitcherWidgetVisualizationsUpdated} event.
 * @beta
 */
export interface DashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload {
    /**
     * Reference to changed visualization switcher widget.
     */
    readonly ref: ObjRef;

    /**
     * Visualizations to update from switcher widget.
     */
    readonly visualizations: IInsightWidget[];
}

/**
 * This event is emitted when the dashboard's visualization switcher visualizations is updated.
 *
 * @beta
 */
export interface DashboardVisualizationSwitcherWidgetVisualizationsUpdated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATIONS_UPDATED";
    readonly payload: DashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload;
}

/**
 * @internal
 */
export function visualizationSwitcherWidgetVisualizationsUpdated(
    ctx: DashboardContext,
    ref: ObjRef,
    visualizations: IInsightWidget[],
    correlationId?: string,
): DashboardVisualizationSwitcherWidgetVisualizationsUpdated {
    return {
        type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATIONS_UPDATED",
        ctx,
        correlationId,
        payload: {
            ref,
            visualizations,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardVisualizationSwitcherWidgetVisualizationsUpdated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardVisualizationSwitcherWidgetVisualizationsUpdated =
    eventGuard<DashboardVisualizationSwitcherWidgetVisualizationsUpdated>(
        "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATIONS_UPDATED",
    );
