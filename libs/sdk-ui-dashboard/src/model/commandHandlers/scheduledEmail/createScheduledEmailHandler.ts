// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import {
    IScheduledMailDefinition,
    IFilterContextDefinition,
    IScheduledMail,
} from "@gooddata/sdk-backend-spi";
import { PromiseFnReturnType } from "../../types/sagas";
import { CreateScheduledEmail } from "../../commands/scheduledEmail";
import { DashboardScheduledEmailCreated, scheduledEmailCreated } from "../../events/scheduledEmail";

function createScheduledEmail(
    ctx: DashboardContext,
    scheduledEmail: IScheduledMailDefinition,
    filterContext?: IFilterContextDefinition,
): Promise<IScheduledMail> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().createScheduledMail(scheduledEmail, filterContext);
}

export function* createScheduledEmailHandler(
    ctx: DashboardContext,
    cmd: CreateScheduledEmail,
): SagaIterator<DashboardScheduledEmailCreated> {
    // eslint-disable-next-line no-console
    console.debug("handling create scheduled email", cmd, "in context", ctx);

    const scheduledEmail: PromiseFnReturnType<typeof createScheduledEmail> = yield call(
        createScheduledEmail,
        ctx,
        cmd.payload.scheduledEmail,
        cmd.payload.filterContext,
    );

    return scheduledEmailCreated(ctx, scheduledEmail, cmd.correlationId);
}
