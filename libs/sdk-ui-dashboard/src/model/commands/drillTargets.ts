// (C) 2021-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type IAvailableDrillTargets } from "@gooddata/sdk-ui";

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link IAddDrillTargets} command.
 * @alpha
 */
export interface IAddDrillTargetsPayload {
    readonly ref: ObjRef;
    readonly availableDrillTargets: IAvailableDrillTargets;
}

/**
 * Add widget drill targets
 *
 * @alpha
 */
export interface IAddDrillTargets extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL_TARGETS.ADD";
    readonly payload: IAddDrillTargetsPayload;
}

/**
 * Create AddDrillTargets {@link IAddDrillTargets} command.
 *
 * @param ref - Unique widget ref
 * @param availableDrillTargets - Available widget drill targets {@link @gooddata/sdk-ui#IAvailableDrillTargets}
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 * @returns AddDrillTargets command
 *
 * @alpha
 */
export function addDrillTargets(
    ref: ObjRef,
    availableDrillTargets: IAvailableDrillTargets,
    correlationId?: string,
): IAddDrillTargets {
    return {
        type: "GDC.DASH/CMD.DRILL_TARGETS.ADD",
        correlationId,
        payload: {
            ref,
            availableDrillTargets,
        },
    };
}
