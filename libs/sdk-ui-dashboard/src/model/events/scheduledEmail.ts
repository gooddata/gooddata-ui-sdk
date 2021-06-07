// (C) 2021 GoodData Corporation
import { IScheduledMail } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

/**
 * This event is emitted after the scheduled email is successfully created.
 *
 * @internal
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

//
//
//
