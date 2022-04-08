// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { IScheduledMailDefinition } from "@gooddata/sdk-model";
import { SaveScheduledEmail } from "../../commands/scheduledEmail";
import { DashboardScheduledEmailSaved, scheduledEmailSaved } from "../../events/scheduledEmail";
import { isObjRef } from "@gooddata/sdk-model";

function saveScheduledEmail(ctx: DashboardContext, scheduledEmail: IScheduledMailDefinition): Promise<void> {
    const { backend, workspace } = ctx;
    if (!isObjRef(scheduledEmail)) {
        throw new Error("Cannot save schedule not referencing to an persisted object");
    }
    return backend.workspace(workspace).dashboards().updateScheduledMail(scheduledEmail, scheduledEmail);
}

export function* saveScheduledEmailHandler(
    ctx: DashboardContext,
    cmd: SaveScheduledEmail,
): SagaIterator<DashboardScheduledEmailSaved> {
    yield call(saveScheduledEmail, ctx, cmd.payload.scheduledEmail);

    return scheduledEmailSaved(ctx, cmd.correlationId);
}
