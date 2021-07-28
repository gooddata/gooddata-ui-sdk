// (C) 2021 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { IDashboardCommand } from "./base";

/**
 * Add widget drill targets
 *
 * @alpha
 */
export interface AddDrillTargets extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DRILL_TARGETS.ADD";
    readonly payload: {
        readonly ref: ObjRef;
        readonly availableDrillTargets: IAvailableDrillTargets;
    };
}

/**
 * Create AddDrillTargets {@link AddDrillTargets} command.
 *
 * @param ref - Unique widget ref
 * @param availableDrillTargets - Available widget drill targets {@link @gooddata/sdk-ui#IAvailableDrillTargets}
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 * @returns AddDrillTargets command
 *
 * @alpha
 */
export function addDrillTargets(
    ref: ObjRef,
    availableDrillTargets: IAvailableDrillTargets,
    correlationId?: string,
): AddDrillTargets {
    return {
        type: "GDC.DASH/CMD.DRILL_TARGETS.ADD",
        correlationId,
        payload: {
            ref,
            availableDrillTargets,
        },
    };
}
