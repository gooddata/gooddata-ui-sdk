// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { IScheduledMailDefinition, ObjRef, isObjRef } from "@gooddata/sdk-model";
import { SaveScheduledEmail } from "../../commands/scheduledEmail.js";
import { DashboardScheduledEmailSaved, scheduledEmailSaved } from "../../events/scheduledEmail.js";

function saveScheduledEmail(
    ctx: DashboardContext,
    scheduledEmail: IScheduledMailDefinition,
    filterContextRef?: ObjRef,
): Promise<void> {
    const { backend, workspace } = ctx;
    if (!isObjRef(scheduledEmail)) {
        throw new Error("Cannot save schedule not referencing to an persisted object");
    }
    return backend
        .workspace(workspace)
        .dashboards()
        .updateScheduledMail(scheduledEmail, scheduledEmail, filterContextRef);
}

export function* saveScheduledEmailHandler(
    ctx: DashboardContext,
    cmd: SaveScheduledEmail,
): SagaIterator<DashboardScheduledEmailSaved> {
    const { scheduledEmail, filterContextRef } = cmd.payload;
    yield call(saveScheduledEmail, ctx, scheduledEmail, filterContextRef);

    return scheduledEmailSaved(ctx, cmd.correlationId);
}
