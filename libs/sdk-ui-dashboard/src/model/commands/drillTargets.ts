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
        readonly widgetRef: ObjRef;
        readonly availableDrillTargets: IAvailableDrillTargets;
    };
}

/**
 * Create AddDrillTargets {@link AddDrillTargets} command.
 *
 * @param widgetRef - Unique widget ref
 * @param availableDrillTargets - Available widget drill targets {@link @gooddata/sdk-ui#IAvailableDrillTargets}
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 * @returns AddDrillTargets command
 *
 * @alpha
 */
export function addDrillTargets(
    widgetRef: ObjRef,
    availableDrillTargets: IAvailableDrillTargets,
    correlationId?: string,
): AddDrillTargets {
    return {
        type: "GDC.DASH/CMD.DRILL_TARGETS.ADD",
        correlationId,
        payload: {
            widgetRef,
            availableDrillTargets,
        },
    };
}
