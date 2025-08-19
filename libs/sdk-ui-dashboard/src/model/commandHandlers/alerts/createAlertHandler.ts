// (C) 2024-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { IAutomationMetadataObject, IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";

import { CreateAlert } from "../../commands/alerts.js";
import { DashboardAlertCreated, alertCreated } from "../../events/alerts.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

function createAlert(
    ctx: DashboardContext,
    alert: IAutomationMetadataObjectDefinition,
): Promise<IAutomationMetadataObject> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).automations().createAutomation(alert);
}

export function* createAlertHandler(
    ctx: DashboardContext,
    cmd: CreateAlert,
): SagaIterator<DashboardAlertCreated> {
    const alert: PromiseFnReturnType<typeof createAlert> = yield call(createAlert, ctx, cmd.payload.alert);

    return alertCreated(ctx, alert, cmd.correlationId);
}
