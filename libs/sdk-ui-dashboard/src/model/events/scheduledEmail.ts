// (C) 2021-2025 GoodData Corporation
import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link DashboardScheduledEmailCreated} event.
 * @beta
 */
export interface DashboardScheduledEmailCreatedPayload {
    /**
     * The scheduled email created.
     */
    readonly scheduledEmail: IAutomationMetadataObject;
}

/**
 * This event is emitted after the scheduled email is successfully created.
 *
 * @beta
 */
export interface DashboardScheduledEmailCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED";
    readonly payload: DashboardScheduledEmailCreatedPayload;
}

export function scheduledEmailCreated(
    ctx: DashboardContext,
    scheduledEmail: IAutomationMetadataObject,
    correlationId?: string,
): DashboardScheduledEmailCreated {
    return {
        type: "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED",
        ctx,
        correlationId,
        payload: {
            scheduledEmail,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardScheduledEmailCreated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardScheduledEmailCreated = eventGuard<DashboardScheduledEmailCreated>(
    "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED",
);

/**
 * This event is emitted after the scheduled email is successfully saved.
 *
 * @beta
 */
export interface DashboardScheduledEmailSaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED";
}

export function scheduledEmailSaved(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardScheduledEmailSaved {
    return {
        type: "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardScheduledEmailSaved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardScheduledEmailSaved = eventGuard<DashboardScheduledEmailSaved>(
    "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED",
);

/**
 * This event is emitted after the automations are refreshed (after creating, updating, or removing alerts or scheduled exports).
 *
 * @beta
 */
export interface DashboardAutomationsRefreshed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.AUTOMATIONS.REFRESHED";
}

export function automationsRefreshed(
    ctx: DashboardContext,
    correlationId?: string,
): DashboardAutomationsRefreshed {
    return {
        type: "GDC.DASH/EVT.AUTOMATIONS.REFRESHED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAutomationsRefreshed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAutomationsRefreshed = eventGuard<DashboardAutomationsRefreshed>(
    "GDC.DASH/EVT.AUTOMATIONS.REFRESHED",
);
