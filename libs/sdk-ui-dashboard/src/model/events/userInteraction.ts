// (C) 2021-2023 GoodData Corporation
import { AccessGranularPermission, ShareStatus } from "@gooddata/sdk-model";
import isString from "lodash/isString.js";
import { DashboardEventBody, IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

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
export type ShareDialogInteractionType =
    | "SHARE_DIALOG_OPENED"
    | "SHARE_DIALOG_CLOSED"
    | "SHARE_DIALOG_SAVED"
    | "SHARE_DIALOG_PERMISSIONS_DROPDOWN_OPENED"
    | "SHARE_DIALOG_PERMISSIONS_CHANGED"
    | "SHARE_DIALOG_GRANTEE_REMOVED"
    | "SHARE_DIALOG_GRANTEE_ADDED"
    | "SHARE_DIALOG_AVAILABLE_GRANTEE_LIST_OPENED";

/**
 * @beta
 */
export type ShareDialogInteractionData = {
    type: ShareDialogInteractionType;
    flowId: string;
    currentUserPermission: AccessGranularPermission;
    isCurrentUserWorkspaceManager: boolean;
    isSharedObjectLocked: boolean;
    sharedObjectStatus: ShareStatus;
    isCurrentUserSelfUpdating?: boolean;
    isExistingGrantee?: boolean;
    granteeType?: "user" | "group";
    granteeEffectivePermission?: AccessGranularPermission;
    granteeUpdatedPermission?: AccessGranularPermission;
    numberOfAvailableGrantees?: number;
};

/**
 * @beta
 */
export type ShareDialogInteractionPayload = UserInteractionPayloadWithDataBase<
    "shareDialogInteraction",
    ShareDialogInteractionData
>;

/**
 * @beta
 */
export interface BareUserInteractionPayload {
    interaction: "kpiAlertDialogClosed" | "poweredByGDLogoClicked" | "attributeFilterTitleResetClicked";
}

/**
 * @beta
 */
export type UserInteractionPayloadWithData =
    | KpiAlertDialogOpenedPayload
    | DescriptionTooltipOpenedPayload
    | ShareDialogInteractionPayload;

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
