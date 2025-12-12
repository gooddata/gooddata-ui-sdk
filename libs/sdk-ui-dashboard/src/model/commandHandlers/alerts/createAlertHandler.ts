// (C) 2024-2025 GoodData Corporation
import { type SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { type CreateAlert } from "../../commands/alerts.js";
import { type DashboardAlertCreated, alertCreated } from "../../events/alerts.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";

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
