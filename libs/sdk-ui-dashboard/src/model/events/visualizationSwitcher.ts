// (C) 2024 GoodData Corporation

// (C) 024 GoodData Corporation

import { IInsightWidget, ObjRef } from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base.js";
import { DashboardContext } from "../types/commonTypes.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardVisualizationSwitcherWidgetAddVisualization} event.
 * @beta
 */
export interface DashboardVisualizationSwticherWidgetAddVisualizationPayload {
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
 * This event is emitted when the dashboard's rich text widget content is changed.
 *
 * @beta
 */
export interface DashboardVisualizationSwitcherWidgetAddVisualization extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION";
    readonly payload: DashboardVisualizationSwticherWidgetAddVisualizationPayload;
}

/**
 * @internal
 */
export function visualizationSwitcherWidgetAddVisualization(
    ctx: DashboardContext,
    ref: ObjRef,
    visualization: IInsightWidget,
    correlationId?: string,
): DashboardVisualizationSwitcherWidgetAddVisualization {
    return {
        type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION",
        ctx,
        correlationId,
        payload: {
            ref,
            visualization,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardVisualizationSwitcherWidgetAddVisualization}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardVisualizationSwitcherWidgetAddVisualization =
    eventGuard<DashboardVisualizationSwitcherWidgetAddVisualization>(
        "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.ADD_VISUALIZATION",
    );

/**
 * Payload of the {@link DashboardVisualizationSwitcherWidgetRemoveVisualization} event.
 * @beta
 */
export interface DashboardVisualizationSwticherWidgetRemoveVisualizationPayload {
    /**
     * Reference to changed visualization switcher widget.
     */
    readonly ref: ObjRef;

    /**
     * Visualization to remove from switcher widget.
     */
    readonly visualization: IInsightWidget;
}

/**
 * This event is emitted when the dashboard's rich text widget content is changed.
 *
 * @beta
 */
export interface DashboardVisualizationSwitcherWidgetRemoveVisualization extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.REMOVE_VISUALIZATION";
    readonly payload: DashboardVisualizationSwticherWidgetRemoveVisualizationPayload;
}

/**
 * @internal
 */
export function visualizationSwitcherWidgetRemoveVisualization(
    ctx: DashboardContext,
    ref: ObjRef,
    visualization: IInsightWidget,
    correlationId?: string,
): DashboardVisualizationSwitcherWidgetRemoveVisualization {
    return {
        type: "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.REMOVE_VISUALIZATION",
        ctx,
        correlationId,
        payload: {
            ref,
            visualization,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardVisualizationSwitcherWidgetRemoveVisualization}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardVisualizationSwitcherWidgetRemoveVisualization =
    eventGuard<DashboardVisualizationSwitcherWidgetRemoveVisualization>(
        "GDC.DASH/EVT.VISUALIZATION_SWITCHER_WIDGET.REMOVE_VISUALIZATION",
    );
