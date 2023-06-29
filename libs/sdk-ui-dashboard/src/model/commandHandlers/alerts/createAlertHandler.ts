// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes.js";
import { IWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-model";
import { CreateAlert } from "../../commands/alerts.js";
import { alertCreated, DashboardAlertCreated } from "../../events/alerts.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { alertsActions } from "../../store/alerts/index.js";

function createAlert(
    ctx: DashboardContext,
    alert: IWidgetAlert | IWidgetAlertDefinition,
): Promise<IWidgetAlert> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().createWidgetAlert(alert);
}

export function* createAlertHandler(
    ctx: DashboardContext,
    cmd: CreateAlert,
): SagaIterator<DashboardAlertCreated> {
    const alert: PromiseFnReturnType<typeof createAlert> = yield call(createAlert, ctx, cmd.payload.alert);

    yield put(alertsActions.addAlert(alert));

    return alertCreated(ctx, alert, cmd.correlationId);
}
