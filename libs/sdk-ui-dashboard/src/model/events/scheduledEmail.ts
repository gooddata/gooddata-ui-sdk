// (C) 2021-2022 GoodData Corporation
import { IScheduledMail } from "@gooddata/sdk-model";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";
import { eventGuard } from "./util";

/**
 * Payload of the {@link DashboardScheduledEmailCreated} event.
 * @alpha
 */
export interface DashboardScheduledEmailCreatedPayload {
    /**
     * The scheduled email created.
     */
    readonly scheduledEmail: IScheduledMail;
}

/**
 * This event is emitted after the scheduled email is successfully created.
 *
 * @alpha
 */
export interface DashboardScheduledEmailCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED";
    readonly payload: DashboardScheduledEmailCreatedPayload;
}

export function scheduledEmailCreated(
    ctx: DashboardContext,
    scheduledEmail: IScheduledMail,
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
 * @alpha
 */
export const isDashboardScheduledEmailCreated = eventGuard<DashboardScheduledEmailCreated>(
    "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED",
);
