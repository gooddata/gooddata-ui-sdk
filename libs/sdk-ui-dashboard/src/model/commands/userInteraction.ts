// (C) 2021 GoodData Corporation
import { IDashboardCommand } from "./base";

/**
 * @alpha
 */
export type UserInteractionType = "poweredByGDLogoClicked";

/**
 * Triggers user interaction.
 * This command should be used purely for user interactions that cannot be tracked by other existing events.
 *
 * @alpha
 */
export interface UserInteraction extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.USER_INTERACTION";
    readonly payload: {
        interaction: UserInteractionType;
    };
}

/**
 * @alpha
 */
export function userInteraction(interaction: UserInteractionType, correlationId?: string): UserInteraction {
    return {
        type: "GDC.DASH/CMD.USER_INTERACTION",
        correlationId,
        payload: {
            interaction,
        },
    };
}
