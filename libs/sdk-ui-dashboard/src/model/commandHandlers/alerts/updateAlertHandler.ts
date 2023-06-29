// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { objRefToString, IWidgetAlert } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes.js";
import { UpdateAlert } from "../../commands/alerts.js";
import { alertUpdated, DashboardAlertUpdated } from "../../events/alerts.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { alertsActions } from "../../store/alerts/index.js";

function updateAlert(ctx: DashboardContext, alert: IWidgetAlert): Promise<IWidgetAlert> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().updateWidgetAlert(alert);
}

export function* updateAlertHandler(
    ctx: DashboardContext,
    cmd: UpdateAlert,
): SagaIterator<DashboardAlertUpdated> {
    const alert: PromiseFnReturnType<typeof updateAlert> = yield call(updateAlert, ctx, cmd.payload.alert);

    yield put(
        alertsActions.updateAlert({
            changes: cmd.payload.alert,
            id: objRefToString(cmd.payload.alert.ref),
        }),
    );

    return alertUpdated(ctx, alert, cmd.correlationId);
}
