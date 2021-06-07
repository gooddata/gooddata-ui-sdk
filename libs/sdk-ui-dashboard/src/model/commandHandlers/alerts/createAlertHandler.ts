// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { DashboardContext } from "../../types/commonTypes";
import { IWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-backend-spi";
import { CreateAlert } from "../../commands/alerts";
import { alertCreated } from "../../events/alerts";
import { PromiseFnReturnType } from "../../types/sagas";
import { alertsActions } from "../../state/alerts";
import { internalErrorOccurred } from "../../events/general";

function createAlert(
    ctx: DashboardContext,
    alert: IWidgetAlert | IWidgetAlertDefinition,
): Promise<IWidgetAlert> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().createWidgetAlert(alert);
}

export function* createAlertHandler(ctx: DashboardContext, cmd: CreateAlert): SagaIterator<void> {
    // eslint-disable-next-line no-console
    console.debug("handling create alert", cmd, "in context", ctx);

    try {
        const alert: PromiseFnReturnType<typeof createAlert> = yield call(
            createAlert,
            ctx,
            cmd.payload.alert,
        );

        yield put(alertsActions.addAlert(alert));

        yield dispatchDashboardEvent(alertCreated(ctx, alert, cmd.correlationId));
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
