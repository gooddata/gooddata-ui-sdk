// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { objRefToString } from "@gooddata/sdk-model";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { DashboardContext } from "../../types/commonTypes";
import { UpdateAlert } from "../../commands/alerts";
import { alertUpdated } from "../../events/alerts";
import { PromiseFnReturnType } from "../../types/sagas";
import { alertsActions } from "../../state/alerts";
import { internalErrorOccurred } from "../../events/general";

function updateAlert(ctx: DashboardContext, alert: IWidgetAlert): Promise<IWidgetAlert> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().updateWidgetAlert(alert);
}

export function* updateAlertHandler(ctx: DashboardContext, cmd: UpdateAlert): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.debug("handling update alert", cmd, "in context", ctx);

    try {
        const alert: PromiseFnReturnType<typeof updateAlert> = yield call(
            updateAlert,
            ctx,
            cmd.payload.alert,
        );

        yield put(
            alertsActions.updateAlert({
                changes: cmd.payload.alert,
                id: objRefToString(cmd.payload.alert.ref),
            }),
        );
        yield dispatchDashboardEvent(alertUpdated(ctx, alert, cmd.correlationId));
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
