// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { IAutomationMetadataObject, isObjRef } from "@gooddata/sdk-model";

import { SaveScheduledEmail } from "../../commands/scheduledEmail.js";
import { DashboardScheduledEmailSaved, scheduledEmailSaved } from "../../events/scheduledEmail.js";
import { DashboardContext } from "../../types/commonTypes.js";

function saveScheduledEmail(
    ctx: DashboardContext,
    scheduledEmail: IAutomationMetadataObject,
): Promise<IAutomationMetadataObject> {
    const { backend, workspace } = ctx;
    if (!isObjRef(scheduledEmail)) {
        throw new Error("Cannot save schedule not referencing to an persisted object");
    }
    return backend.workspace(workspace).automations().updateAutomation(scheduledEmail);
}

export function* saveScheduledEmailHandler(
    ctx: DashboardContext,
    cmd: SaveScheduledEmail,
): SagaIterator<DashboardScheduledEmailSaved> {
    const { scheduledEmail } = cmd.payload;
    yield call(saveScheduledEmail, ctx, scheduledEmail);

    return scheduledEmailSaved(ctx, cmd.correlationId);
}
