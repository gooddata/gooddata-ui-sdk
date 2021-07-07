// (C) 2021 GoodData Corporation
import { IDashboardCommand } from "./base";

/**
 * @internal
 */
export type UserInteraction = "poweredByGDLogoClicked";

/**
 * Triggers user interaction logging.
 *
 * Note that this command should be used purely for user interactions that cannot be tracked by other existing events.
 *
 * @internal
 */
export interface LogUserInteraction extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.LOG_USER_INTERACTION";
    readonly payload: {
        interaction: UserInteraction;
    };
}

/**
 * @internal
 */
export function logUserInteraction(interaction: UserInteraction, correlationId?: string): LogUserInteraction {
    return {
        type: "GDC.DASH/CMD.LOG_USER_INTERACTION",
        correlationId,
        payload: {
            interaction,
        },
    };
}
