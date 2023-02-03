// (C) 2021-2023 GoodData Corporation
import isString from "lodash/isString";
import { DashboardEventBody, IDashboardEvent } from "./base";
import { eventGuard } from "./util";

/**
 * @beta
 */
export interface UserInteractionPayloadWithDataBase<TType extends string, TData extends object> {
    interaction: TType;
    data: TData;
}

/**
 * @beta
 */
export type KpiAlertDialogOpenedPayload = UserInteractionPayloadWithDataBase<
    "kpiAlertDialogOpened",
    {
        alreadyHasAlert: boolean;
    }
>;

/**
 * @beta
 */
export type DescriptionTooltipOpenedFrom = "kpi" | "widget" | "insight";
/**
 * @beta
 */
export type DescriptionTooltipOpenedType = "inherit" | "custom";
/**
 * @beta
 */
export type DescriptionTooltipOpenedData = {
    from: DescriptionTooltipOpenedFrom;
    type: DescriptionTooltipOpenedType;
    description?: string;
};
/**
 * @beta
 */
export type DescriptionTooltipOpenedPayload = UserInteractionPayloadWithDataBase<
    "descriptionTooltipOpened",
    DescriptionTooltipOpenedData
>;

/**
 * @beta
 */
export interface BareUserInteractionPayload {
    interaction: "kpiAlertDialogClosed" | "poweredByGDLogoClicked";
}

/**
 * @beta
 */
export type UserInteractionPayloadWithData = KpiAlertDialogOpenedPayload | DescriptionTooltipOpenedPayload;

/**
 * @beta
 */
export type UserInteractionPayload = UserInteractionPayloadWithData | BareUserInteractionPayload;

/**
 * @beta
 */
export type UserInteractionType = UserInteractionPayload["interaction"];

/**
 * @beta
 */
export type BareUserInteractionType = BareUserInteractionPayload["interaction"];

/**
 * This event is emitted after the user interaction that cannot be tracked by other existing events
 * is triggered.
 *
 * @beta
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
 * @beta
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
 * @beta
 */
export const isDashboardUserInteractionTriggered = eventGuard<DashboardUserInteractionTriggered>(
    "GDC.DASH/EVT.USER_INTERACTION.TRIGGERED",
);
