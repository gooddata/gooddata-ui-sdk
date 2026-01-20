// (C) 2025-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IShowWidgetAsTableSet} event.
 * @beta
 */
export interface IShowWidgetAsTableSetPayload {
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
export interface IShowWidgetAsTableSet extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SHOW_WIDGET_AS_TABLE.SET";
    readonly payload: IShowWidgetAsTableSetPayload;
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
): IShowWidgetAsTableSet {
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
 * Tests whether the provided object is an instance of {@link IShowWidgetAsTableSet}.
 *
 * @param obj - object to test
 * @beta
 */
export const isShowWidgetAsTableSet = eventGuard<IShowWidgetAsTableSet>(
    "GDC.DASH/EVT.SHOW_WIDGET_AS_TABLE.SET",
);
