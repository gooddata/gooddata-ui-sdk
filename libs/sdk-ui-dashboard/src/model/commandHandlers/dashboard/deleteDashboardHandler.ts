// (C) 2021-2025 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { type SagaIterator } from "redux-saga";
import { type SagaReturnType, call, put, select } from "redux-saga/effects";
import { invariant } from "ts-invariant";

import { type ObjRef, areObjRefsEqual, idRef, uriRef } from "@gooddata/sdk-model";

import { actionsToInitializeNewDashboard } from "./common/stateInitializers.js";
import { type DeleteDashboard } from "../../commands/index.js";
import { dashboardDeleted } from "../../events/dashboard.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type DashboardDeleted } from "../../events/index.js";
import { selectAllCatalogDisplayFormsMap } from "../../store/catalog/catalogSelectors.js";
import { selectDateFilterConfig, selectSettings } from "../../store/config/configSelectors.js";
import { executionResultsActions } from "../../store/executionResults/index.js";
import { selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

function deleteDashboard(ctx: DashboardContext, dashboardRef: ObjRef): Promise<void> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().deleteDashboard(dashboardRef);
}

/**
 * Resets the essential state so that an empty dashboard is rendered. This includes change of the
 * saga context so that it contains an empty dashboardRef.
 *
 * Note: This will not clear any of the dashboard-agnostic global state such as config and settings.
 */
function* resetToNewDashboard(ctx: DashboardContext): SagaIterator<void> {
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfig> = yield select(selectDateFilterConfig);
    const displayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    const { initActions }: SagaReturnType<typeof actionsToInitializeNewDashboard> = yield call(
        actionsToInitializeNewDashboard,
        ctx,
        settings,
        dateFilterConfig,
        displayForms,
    );

    yield put(
        batchActions(
            [...initActions, executionResultsActions.clearAllExecutionResults()],
            "@@GDC.DASH/BATCH.CLEAR",
        ),
    );

    /*
     * We must do this by mutating the context object, the setContext effect changes the context only
     * for the current saga and its children. See https://github.com/redux-saga/redux-saga/issues/1798#issuecomment-468054586
     */
    ctx.dashboardRef = undefined;
}

export function* deleteDashboardHandler(
    ctx: DashboardContext,
    cmd: DeleteDashboard,
): SagaIterator<DashboardDeleted> {
    const existingDashboardRef = ctx.dashboardRef;
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> =
        yield select(selectPersistedDashboard);

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

    yield call(resetToNewDashboard, ctx);

    return dashboardDeleted(ctx, persistedDashboard, cmd.correlationId);
}
