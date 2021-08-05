// (C) 2021 GoodData Corporation
import { UserInteractionPayload } from "../commands/userInteraction";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

/**
 * This event is emitted after the user interaction that cannot be tracked by other existing events
 * is triggered.
 *
 * @alpha
 */
export interface DashboardUserInteractionTriggered extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.USER_INTERACTION.TRIGGERED";
    readonly payload: UserInteractionPayload;
}

/**
 * @alpha
 */
export function userInteractionTriggered(
    ctx: DashboardContext,
    interactionPayload: UserInteractionPayload,
    correlationId?: string,
): DashboardUserInteractionTriggered {
    return {
        type: "GDC.DASH/EVT.USER_INTERACTION.TRIGGERED",
        ctx,
        correlationId,
        payload: interactionPayload,
    };
}
