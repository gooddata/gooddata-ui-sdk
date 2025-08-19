// (C) 2025 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link ShowWidgetAsTableSet} event.
 * @beta
 */
export interface ShowWidgetAsTableSetPayload {
    /**
     * Reference to the widget
     */
    ref: ObjRef;
    /**
     * Whether the widget is shown as table
     */
    showAsTable: boolean;
}

/**
 * This event is emitted after a widget's show as table state has been set.
 *
 * @beta
 */
export interface ShowWidgetAsTableSet extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SHOW_WIDGET_AS_TABLE.SET";
    readonly payload: ShowWidgetAsTableSetPayload;
}

/**
 * Creates a new ShowWidgetAsTableSet event.
 *
 * @param ctx - dashboard context
 * @param ref - reference to the widget
 * @param showAsTable - whether to show as table
 * @param correlationId - optional correlation ID
 * @beta
 */
export function showWidgetAsTableSet(
    ctx: DashboardContext,
    ref: ObjRef,
    showAsTable: boolean,
    correlationId?: string,
): ShowWidgetAsTableSet {
    return {
        type: "GDC.DASH/EVT.SHOW_WIDGET_AS_TABLE.SET",
        ctx,
        correlationId,
        payload: {
            ref,
            showAsTable,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link ShowWidgetAsTableSet}.
 *
 * @param obj - object to test
 * @beta
 */
export const isShowWidgetAsTableSet = eventGuard<ShowWidgetAsTableSet>(
    "GDC.DASH/EVT.SHOW_WIDGET_AS_TABLE.SET",
);
