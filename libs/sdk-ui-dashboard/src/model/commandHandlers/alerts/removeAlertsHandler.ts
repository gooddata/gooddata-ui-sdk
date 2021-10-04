// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, select, put } from "redux-saga/effects";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes";
import { RemoveAlerts } from "../../commands/alerts";
import { alertsRemoved, DashboardAlertsRemoved } from "../../events/alerts";
import { alertsActions } from "../../store/alerts";
import { selectAlertsMap } from "../../store/alerts/alertsSelectors";
import { validateExistingAlerts } from "./validation/alertsValidation";

function removeAlerts(ctx: DashboardContext, alertRefs: ObjRef[]): Promise<void> {
    const { backend, workspace } = ctx;
    return backend.workspace(workspace).dashboards().deleteWidgetAlerts(alertRefs);
}

export function* removeAlertsHandler(
    ctx: DashboardContext,
    cmd: RemoveAlerts,
): SagaIterator<DashboardAlertsRemoved> {
    const alertsMap: ReturnType<typeof selectAlertsMap> = yield select(selectAlertsMap);
    const alerts = validateExistingAlerts(alertsMap, cmd, ctx);

    const refs = alerts.map((alert) => alert.ref);

    yield call(removeAlerts, ctx, refs);

    const ids = alerts.map((alert) => objRefToString(alert.ref));

    yield put(alertsActions.removeAlerts(ids));

    return alertsRemoved(ctx, alerts, cmd.correlationId);
}
