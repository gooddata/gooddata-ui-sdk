// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { objRefToString } from "@gooddata/sdk-model";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { DashboardContext } from "../../types/commonTypes";
import { RemoveAlert } from "../../commands/alerts";
import { alertRemoved } from "../../events/alerts";
import { alertsActions } from "../../state/alerts";
import { internalErrorOccurred } from "../../events/general";

function removeAlert(ctx: DashboardContext, alert: IWidgetAlert): Promise<void> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().deleteWidgetAlert(alert.ref);
}

export function* removeDashboardAlertHandler(ctx: DashboardContext, cmd: RemoveAlert): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.debug("handling remove alert", cmd, "in context", ctx);

    try {
        yield call(removeAlert, ctx, cmd.payload.alert);

        yield put(alertsActions.removeAlert(objRefToString(cmd.payload.alert.ref)));

        yield dispatchDashboardEvent(alertRemoved(ctx, cmd.payload.alert, cmd.correlationId));
    } catch (e) {
        yield dispatchDashboardEvent(
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while creating alert",
                e,
                cmd.correlationId,
            ),
        );
    }
}
