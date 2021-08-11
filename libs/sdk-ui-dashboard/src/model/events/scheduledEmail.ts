// (C) 2021 GoodData Corporation
import { IScheduledMail } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";
import { eventGuard } from "./util";

/**
 * This event is emitted after the scheduled email is successfully created.
 *
 * @alpha
 */
export interface DashboardScheduledEmailCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED";
    readonly payload: {
        readonly scheduledEmail: IScheduledMail;
    };
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

//
//
//
