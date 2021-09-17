// (C) 2021 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes";
import { DeleteDashboard } from "../../commands";
import { SagaIterator } from "redux-saga";
import { DashboardDeleted } from "../../events";
import { call, put, SagaReturnType, select, setContext } from "redux-saga/effects";
import { invalidArgumentsProvided } from "../../events/general";
import { areObjRefsEqual, idRef, ObjRef, uriRef } from "@gooddata/sdk-model";
import { batchActions } from "redux-batched-actions";
import { executionResultsActions } from "../../state/executionResults";
import { selectDateFilterConfig } from "../../state/config/configSelectors";
import { selectPersistedDashboard } from "../../state/meta/metaSelectors";
import { dashboardDeleted } from "../../events/dashboard";
import { invariant } from "ts-invariant";
import { actionsToInitializeNewDashboard } from "./common/stateInitializers";

function deleteDashboard(ctx: DashboardContext, dashboardRef: ObjRef): Promise<void> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().deleteDashboard(dashboardRef);
}

/**
 * Resets the essential state so that an empty dashboard is rendered. This includes change of the
 * saga context so that it contains an empty dashboardRef.
 *
 * Note: This will not clear any of the dashboard-agnostic global state such as config and settings.
 *
 * @param ctx
 */
function* resetToNewDashboard(ctx: DashboardContext): SagaIterator<DashboardContext> {
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfig> = yield select(selectDateFilterConfig);

    yield put(
        batchActions(
            [
                ...actionsToInitializeNewDashboard(dateFilterConfig),
                executionResultsActions.clearAllExecutionResults(),
            ],
            "@@GDC.DASH/BATCH.CLEAR",
        ),
    );

    const newContext: DashboardContext = {
        ...ctx,
        dashboardRef: undefined,
    };

    yield setContext({
        dashboardContext: newContext,
    });

    return newContext;
}

export function* deleteDashboardHandler(
    ctx: DashboardContext,
    cmd: DeleteDashboard,
): SagaIterator<DashboardDeleted> {
    const existingDashboardRef = ctx.dashboardRef;
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );

    if (!persistedDashboard) {
        throw invalidArgumentsProvided(ctx, cmd, "Attempting to delete a dashboard that was never saved.");
    }

    // if this invariant fails, it means the state is inconsistent; previous command processing must have done
    // something wrong; for instance updated context with some ref but did not update the persisted dashboard
    // accordingly
    invariant(
        existingDashboardRef &&
            (areObjRefsEqual(existingDashboardRef, uriRef(persistedDashboard.uri)) ||
                areObjRefsEqual(existingDashboardRef, idRef(persistedDashboard.identifier))),
    );

    // perform the actual delete
    yield call(deleteDashboard, ctx, persistedDashboard.ref);

    const newContext: SagaReturnType<typeof resetToNewDashboard> = yield call(resetToNewDashboard, ctx);

    return dashboardDeleted(newContext, persistedDashboard, cmd.correlationId);
}
