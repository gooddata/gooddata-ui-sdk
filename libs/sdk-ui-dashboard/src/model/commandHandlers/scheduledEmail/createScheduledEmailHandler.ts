// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { DashboardContext } from "../../types/commonTypes";
import {
    IScheduledMailDefinition,
    IFilterContextDefinition,
    IScheduledMail,
} from "@gooddata/sdk-backend-spi";
import { PromiseFnReturnType } from "../../types/sagas";
import { internalErrorOccurred } from "../../events/general";
import { CreateScheduledEmail } from "../../commands/scheduledEmail";
import { scheduledEmailCreated } from "../../events/scheduledEmail";

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
): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.debug("handling create scheduled email", cmd, "in context", ctx);

    try {
        const scheduledEmail: PromiseFnReturnType<typeof createScheduledEmail> = yield call(
            createScheduledEmail,
            ctx,
            cmd.payload.scheduledEmail,
            cmd.payload.filterContext,
        );

        yield dispatchDashboardEvent(scheduledEmailCreated(ctx, scheduledEmail, cmd.correlationId));
    } catch (e) {
        yield dispatchDashboardEvent(
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while creating scheduled email",
                e,
                cmd.correlationId,
            ),
        );
    }
}
