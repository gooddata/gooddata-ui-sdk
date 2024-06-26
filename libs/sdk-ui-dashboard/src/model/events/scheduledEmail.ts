// (C) 2021-2024 GoodData Corporation
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { DashboardContext } from "../types/commonTypes.js";
import { IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

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
