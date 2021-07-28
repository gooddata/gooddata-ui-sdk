// (C) 2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

/**
 *  Widget drill targets added event
 *
 * @alpha
 */
export interface DrillTargetsAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.DRILL_TARGETS.ADDED";
    readonly payload: {
        /**
         * Reference to Insight Widget
         */
        readonly ref: ObjRef;
        readonly availableDrillTargets: IAvailableDrillTargets;
    };
}

/**
 * Create DrillTargetsAdded {@link DrillTargetsAdded} event.
 *
 * @param ref - Unique widget ref
 * @param availableDrillTargets - Available widget drill targets {@link @gooddata/sdk-ui#IAvailableDrillTargets}
 * @param  correlationId - correlationId
 * @returns - DrillTargetsAdded command
 *
 * @alpha
 */
export function drillTargetsAdded(
    ctx: DashboardContext,
    ref: ObjRef,
    availableDrillTargets: IAvailableDrillTargets,
    correlationId?: string,
): DrillTargetsAdded {
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
