// (C) 2021 GoodData Corporation
import isString from "lodash/isString";
import { IDashboardCommand } from "./base";

/**
 * @alpha
 */
export interface UserInteractionPayloadWithDataBase<TType extends string, TData extends object> {
    interaction: TType;
    data: TData;
}

/**
 * @alpha
 */
export type KpiAlertDialogOpenedPayload = UserInteractionPayloadWithDataBase<
    "kpiAlertDialogOpened",
    {
        alreadyHasAlert: boolean;
    }
>;

/**
 * @alpha
 */
export interface BareUserInteractionPayload {
    interaction: "kpiAlertDialogClosed" | "poweredByGDLogoClicked";
}

/**
 * @alpha
 */
export type UserInteractionPayloadWithData = KpiAlertDialogOpenedPayload;

/**
 * @alpha
 */
export type UserInteractionPayload = UserInteractionPayloadWithData | BareUserInteractionPayload;

/**
 * @alpha
 */
export type UserInteractionType = UserInteractionPayload["interaction"];

/**
 * @alpha
 */
export type BareUserInteractionType = BareUserInteractionPayload["interaction"];

/**
 * Triggers user interaction.
 * This command should be used purely for user interactions that cannot be tracked by other existing events.
 *
 * @alpha
 */
export interface UserInteraction extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.USER_INTERACTION";
    readonly payload: UserInteractionPayload;
}

/**
 * Creates the {@link UserInteraction} command.
 *
 * @param interactionPayloadOrType - interaction payload or a type of a user interaction without extra data (for convenience)
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function userInteraction(
    interactionPayloadOrType: UserInteractionPayload | BareUserInteractionType,
    correlationId?: string,
): UserInteraction {
    if (isString(interactionPayloadOrType)) {
        return {
            type: "GDC.DASH/CMD.USER_INTERACTION",
            correlationId,
            payload: { interaction: interactionPayloadOrType },
        };
    }

    return {
        type: "GDC.DASH/CMD.USER_INTERACTION",
        correlationId,
        payload: interactionPayloadOrType,
    };
}
