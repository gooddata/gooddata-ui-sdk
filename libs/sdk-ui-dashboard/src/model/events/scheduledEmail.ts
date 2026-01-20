// (C) 2021-2026 GoodData Corporation

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IDashboardScheduledEmailCreated} event.
 * @beta
 */
export interface IDashboardScheduledEmailCreatedPayload {
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
export interface IDashboardScheduledEmailCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED";
    readonly payload: IDashboardScheduledEmailCreatedPayload;
}

export function scheduledEmailCreated(
    ctx: DashboardContext,
    scheduledEmail: IAutomationMetadataObject,
    correlationId?: string,
): IDashboardScheduledEmailCreated {
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
 * Tests whether the provided object is an instance of {@link IDashboardScheduledEmailCreated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardScheduledEmailCreated = eventGuard<IDashboardScheduledEmailCreated>(
    "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED",
);

/**
 * This event is emitted after the scheduled email is successfully saved.
 *
 * @beta
 */
export interface IDashboardScheduledEmailSaved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED";
}

export function scheduledEmailSaved(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardScheduledEmailSaved {
    return {
        type: "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardScheduledEmailSaved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardScheduledEmailSaved = eventGuard<IDashboardScheduledEmailSaved>(
    "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED",
);

/**
 * This event is emitted after the automations are refreshed (after creating, updating, or removing alerts or scheduled exports).
 *
 * @beta
 */
export interface IDashboardAutomationsRefreshed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.AUTOMATIONS.REFRESHED";
}

export function automationsRefreshed(
    ctx: DashboardContext,
    correlationId?: string,
): IDashboardAutomationsRefreshed {
    return {
        type: "GDC.DASH/EVT.AUTOMATIONS.REFRESHED",
        ctx,
        correlationId,
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardAutomationsRefreshed}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAutomationsRefreshed = eventGuard<IDashboardAutomationsRefreshed>(
    "GDC.DASH/EVT.AUTOMATIONS.REFRESHED",
);
