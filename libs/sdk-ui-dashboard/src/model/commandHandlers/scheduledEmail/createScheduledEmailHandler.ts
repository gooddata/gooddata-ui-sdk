// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { IFilterContextDefinition, IScheduledMail, IScheduledMailDefinition } from "@gooddata/sdk-model";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { CreateScheduledEmail } from "../../commands/scheduledEmail.js";
import { DashboardScheduledEmailCreated, scheduledEmailCreated } from "../../events/scheduledEmail.js";

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
    const scheduledEmail: PromiseFnReturnType<typeof createScheduledEmail> = yield call(
        createScheduledEmail,
        ctx,
        cmd.payload.scheduledEmail,
        cmd.payload.filterContext,
    );

    return scheduledEmailCreated(ctx, scheduledEmail, cmd.correlationId);
}
