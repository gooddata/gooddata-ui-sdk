// (C) 2021 GoodData Corporation
import isString from "lodash/isString";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

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
 * Creates the {@link DashboardUserInteractionTriggered} event.
 *
 * @param interactionPayloadOrType - interaction payload or a type of a user interaction without extra data (for convenience)
 * @param correlationId - optionally specify correlation id to use for this event. this can be used to correlate this event to a command that caused it.
 * @alpha
 */
export function userInteractionTriggered(
    ctx: DashboardContext,
    interactionPayloadOrType: UserInteractionPayload | BareUserInteractionType,
    correlationId?: string,
): DashboardUserInteractionTriggered {
    const payload: UserInteractionPayload = isString(interactionPayloadOrType)
        ? { interaction: interactionPayloadOrType }
        : interactionPayloadOrType;

    return {
        type: "GDC.DASH/EVT.USER_INTERACTION.TRIGGERED",
        ctx,
        correlationId,
        payload,
    };
}
