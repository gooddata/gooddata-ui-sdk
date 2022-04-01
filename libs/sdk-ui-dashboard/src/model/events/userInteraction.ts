// (C) 2021-2022 GoodData Corporation
import isString from "lodash/isString";
import { DashboardEventBody, IDashboardEvent } from "./base";
import { eventGuard } from "./util";

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
 * Creates the {@link DashboardUserInteractionTriggered} event body.
 *
 * @param interactionPayloadOrType - interaction payload or a type of a user interaction without extra data (for convenience)
 * @param correlationId - specify correlation id to use for this event. this can be used to correlate this event to a command that caused it.
 * @alpha
 */
export function userInteractionTriggered(
    interactionPayloadOrType: UserInteractionPayload | BareUserInteractionType,
    correlationId?: string,
): DashboardEventBody<DashboardUserInteractionTriggered> {
    const payload: UserInteractionPayload = isString(interactionPayloadOrType)
        ? { interaction: interactionPayloadOrType }
        : interactionPayloadOrType;

    return {
        type: "GDC.DASH/EVT.USER_INTERACTION.TRIGGERED",
        correlationId,
        payload,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardUserInteractionTriggered}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardUserInteractionTriggered = eventGuard<DashboardUserInteractionTriggered>(
    "GDC.DASH/EVT.USER_INTERACTION.TRIGGERED",
);
