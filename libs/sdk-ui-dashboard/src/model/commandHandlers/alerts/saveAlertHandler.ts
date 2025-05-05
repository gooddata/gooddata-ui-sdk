// (C) 2024-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { IAutomationMetadataObject, isObjRef } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes.js";
import { SaveAlert } from "../../commands/alerts.js";
import { alertSaved, DashboardAlertSaved } from "../../events/alerts.js";

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

export function* saveAlertHandler(ctx: DashboardContext, cmd: SaveAlert): SagaIterator<DashboardAlertSaved> {
    yield call(saveAlert, ctx, cmd.payload.alert);

    return alertSaved(ctx, cmd.payload.alert, cmd.correlationId);
}
