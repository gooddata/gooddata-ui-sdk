// (C) 2021 GoodData Corporation
import { UserInteraction } from "../commands/logUserInteraction";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

/**
 * This event is emitted after user interaction that can be logged.
 *
 * @internal
 */
export interface DashboardUserInteractionLogged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.USER_INTERACTION_LOGGED";
    readonly payload: {
        interaction: UserInteraction;
    };
}

/**
 * @internal
 */
export function userInteractionLogged(
    ctx: DashboardContext,
    interaction: UserInteraction,
    correlationId?: string,
): DashboardUserInteractionLogged {
    return {
        type: "GDC.DASH/EVT.USER_INTERACTION_LOGGED",
        ctx,
        correlationId,
        payload: {
            interaction,
        },
    };
}
