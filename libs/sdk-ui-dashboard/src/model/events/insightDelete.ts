// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../types/commonTypes.js";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link IDashboardInsightDeleted} event.
 * @alpha
 */
export interface IDashboardInsightDeletedPayload {
    /**
     * Reference of the deleted insight.
     */
    readonly ref: ObjRef;
}

/**
 * This event is emitted after the insight (visualization) was deleted from the workspace.
 *
 * @alpha
 */
export interface IDashboardInsightDeleted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.INSIGHT.DELETED";
    readonly payload: IDashboardInsightDeletedPayload;
}

export function insightDeleted(
    ctx: DashboardContext,
    ref: ObjRef,
    correlationId?: string,
): IDashboardInsightDeleted {
    return {
        type: "GDC.DASH/EVT.INSIGHT.DELETED",
        ctx,
        correlationId,
        payload: {
            ref,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardInsightDeleted}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardInsightDeleted = eventGuard<IDashboardInsightDeleted>("GDC.DASH/EVT.INSIGHT.DELETED");
