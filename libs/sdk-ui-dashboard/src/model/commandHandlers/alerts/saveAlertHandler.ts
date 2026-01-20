// (C) 2024-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { type IAutomationMetadataObject, isObjRef } from "@gooddata/sdk-model";

import { type ISaveAlert } from "../../commands/alerts.js";
import { type IDashboardAlertSaved, alertSaved } from "../../events/alerts.js";
import { type DashboardContext } from "../../types/commonTypes.js";

function saveAlert(
    ctx: DashboardContext,
    alert: IAutomationMetadataObject,
): Promise<IAutomationMetadataObject> {
    const { backend, workspace } = ctx;
    if (!isObjRef(alert)) {
        throw new Error("Cannot save alert not referencing to an persisted object");
    }
    return backend.workspace(workspace).automations().updateAutomation(alert);
}

export function* saveAlertHandler(
    ctx: DashboardContext,
    cmd: ISaveAlert,
): SagaIterator<IDashboardAlertSaved> {
    yield call(saveAlert, ctx, cmd.payload.alert);

    return alertSaved(ctx, cmd.payload.alert, cmd.correlationId);
}
