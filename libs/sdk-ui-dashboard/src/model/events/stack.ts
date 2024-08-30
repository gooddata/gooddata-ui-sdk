// (C) 2021-2024 GoodData Corporation

import { IInsight, ObjRef } from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base.js";
import { DashboardContext } from "../types/commonTypes.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardRichTextWidgetContentChanged} event.
 * @beta
 */
export interface DashboardStackWidgetAddInsightPayload {
    /**
     * Reference to changed rich text widget.
     */
    readonly ref: ObjRef;

    readonly insight: IInsight;

    /**
     * New value of the rich text widget content.
     */
    readonly selectedInsight: string;
}

/**
 * This event is emitted when the dashboard's rich text widget content is changed.
 *
 * @beta
 */
export interface DashboardStackWidgetAddInsight extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.STACK_WIDGET.ADD_INSIGHT";
    readonly payload: DashboardStackWidgetAddInsightPayload;
}

/**
 * @internal
 */
export function stackWidgetAddInsight(
    ctx: DashboardContext,
    ref: ObjRef,
    insight: IInsight,
    selectedInsight: string,
    correlationId?: string,
): DashboardStackWidgetAddInsight {
    return {
        type: "GDC.DASH/EVT.STACK_WIDGET.ADD_INSIGHT",
        ctx,
        correlationId,
        payload: {
            ref,
            insight,
            selectedInsight,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardRichTextWidgetContentChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardStackAddInsight = eventGuard<DashboardStackWidgetAddInsight>(
    "GDC.DASH/EVT.STACK_WIDGET.ADD_INSIGHT",
);
