// (C) 2021-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type IAvailableDrillTargets } from "@gooddata/sdk-ui";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IDrillTargetsAdded} event.
 * @alpha
 */
export interface IDrillTargetsAddedPayload {
    /**
     * Reference to Insight Widget
     */
    readonly ref: ObjRef;
    readonly availableDrillTargets: IAvailableDrillTargets;
}

/**
 * Widget drill targets added event
 *
 * @alpha
 */
export interface IDrillTargetsAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL_TARGETS.ADDED";
    readonly payload: IDrillTargetsAddedPayload;
}

/**
 * Create DrillTargetsAdded {@link IDrillTargetsAdded} event.
 *
 * @param ctx -
 * @param ref - Unique widget ref
 * @param availableDrillTargets - Available widget drill targets {@link @gooddata/sdk-ui#IAvailableDrillTargets}
 * @param correlationId - correlationId
 * @returns - DrillTargetsAdded command
 *
 * @alpha
 */
export function drillTargetsAdded(
    ctx: DashboardContext,
    ref: ObjRef,
    availableDrillTargets: IAvailableDrillTargets,
    correlationId?: string,
): IDrillTargetsAdded {
    return {
        type: "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
        ctx,
        correlationId,
        payload: {
            ref,
            availableDrillTargets,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDrillTargetsAdded}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDrillTargetsAdded = eventGuard<IDrillTargetsAdded>("GDC.DASH/EVT.DRILL_TARGETS.ADDED");
