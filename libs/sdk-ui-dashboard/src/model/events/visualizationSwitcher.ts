// (C) 2024-2026 GoodData Corporation

import { type IInsightWidget, type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IDashboardVisualizationSwitcherWidgetVisualizationAdded} event.
 * @beta
 */
export interface IDashboardVisualizationSwitcherWidgetVisualizationAddedPayload {
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
export interface IDashboardVisualizationSwitcherWidgetVisualizationAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATION_ADDED";
    readonly payload: IDashboardVisualizationSwitcherWidgetVisualizationAddedPayload;
}

/**
 * @internal
 */
export function visualizationSwitcherWidgetVisualizationAdded(
    ctx: DashboardContext,
    ref: ObjRef,
    visualization: IInsightWidget,
    correlationId?: string,
): IDashboardVisualizationSwitcherWidgetVisualizationAdded {
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
 * Tests whether the provided object is an instance of {@link IDashboardVisualizationSwitcherWidgetVisualizationAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardVisualizationSwitcherWidgetVisualizationAdded =
    eventGuard<IDashboardVisualizationSwitcherWidgetVisualizationAdded>(
        "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATION_ADDED",
    );

/**
 * Payload of the {@link IDashboardVisualizationSwitcherWidgetVisualizationsUpdated} event.
 * @beta
 */
export interface IDashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload {
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
export interface IDashboardVisualizationSwitcherWidgetVisualizationsUpdated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATIONS_UPDATED";
    readonly payload: IDashboardVisualizationSwitcherWidgetVisualizationsUpdatedPayload;
}

/**
 * @internal
 */
export function visualizationSwitcherWidgetVisualizationsUpdated(
    ctx: DashboardContext,
    ref: ObjRef,
    visualizations: IInsightWidget[],
    correlationId?: string,
): IDashboardVisualizationSwitcherWidgetVisualizationsUpdated {
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
 * Tests whether the provided object is an instance of {@link IDashboardVisualizationSwitcherWidgetVisualizationsUpdated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardVisualizationSwitcherWidgetVisualizationsUpdated =
    eventGuard<IDashboardVisualizationSwitcherWidgetVisualizationsUpdated>(
        "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.VISUALIZATIONS_UPDATED",
    );
