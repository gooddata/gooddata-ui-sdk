// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { IDashboard, IDashboardDefinition, isFilterContext } from "@gooddata/sdk-backend-spi";

import { DashboardContext } from "../../types/commonTypes";
import { ChangeSharing } from "../../commands";
import { DashboardSharingChanged, dashboardSharingChanged } from "../../events/dashboard";
import { selectDashboardRef, selectPersistedDashboard } from "../../store/meta/metaSelectors";
import { invalidArgumentsProvided } from "../../events/general";
import { metaActions } from "../../store/meta";
import { BatchAction, batchActions } from "redux-batched-actions";
import { PromiseFnReturnType } from "../../types/sagas";
import invariant from "ts-invariant";

type DashboardSaveSharingContext = {
    cmd: ChangeSharing;
    /**
     * Dashboard as it is saved on the backend.
     */
    persistedDashboard: IDashboard;
    /**
     * This contains definition that should be used during sharing save. This is based on the `persistedDashboard` but has changed share status
     */
    dashboardToSave: IDashboardDefinition;
};

function* createDashboardSaveSharingContext(cmd: ChangeSharing): SagaIterator<DashboardSaveSharingContext> {
    const { newShareProps } = cmd.payload;

    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );
    invariant(persistedDashboard, "Cant change sharing of unsaved dashboard");
    const { filterContext, ...otherDashboardProps } = persistedDashboard;
    // ignore temp filter context to please TS as it can be present only during export
    const filterContextProp = isFilterContext(filterContext)
        ? {
              filterContext,
          }
        : {};

    const dashboardFromState: IDashboardDefinition = {
        ...otherDashboardProps,
        ...filterContextProp,
    };
    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        ...newShareProps,
    };

    return {
        cmd,
        persistedDashboard,
        dashboardToSave,
    };
}

function updateDashboard(
    ctx: DashboardContext,
    saveSharingCtx: DashboardSaveSharingContext,
): Promise<IDashboard> {
    return ctx.backend
        .workspace(ctx.workspace)
        .dashboards()
        .updateDashboard(saveSharingCtx.persistedDashboard, saveSharingCtx.dashboardToSave);
}

type DashboardSaveSharingResult = {
    batch?: BatchAction;
    dashboard: IDashboard;
};

function* saveSharing(
    ctx: DashboardContext,
    saveSharingCtx: DashboardSaveSharingContext,
): SagaIterator<DashboardSaveSharingResult> {
    const dashboard: PromiseFnReturnType<typeof updateDashboard> = yield call(
        updateDashboard,
        ctx,
        saveSharingCtx,
    );

    const batch = batchActions([metaActions.setMeta({ dashboard })], "@@GDC.DASH.SAVE_SHARING");

    return {
        batch,
        dashboard,
    };
}

export function* changeSharingHandler(
    ctx: DashboardContext,
    cmd: ChangeSharing,
): SagaIterator<DashboardSharingChanged> {
    const dashboardRef = yield select(selectDashboardRef);
    if (!dashboardRef) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            "Dashboard to change its sharing status must have an ObjRef.",
        );
    }

    const saveSharingCtx: SagaReturnType<typeof createDashboardSaveSharingContext> = yield call(
        createDashboardSaveSharingContext,
        cmd,
    );

    const result: SagaReturnType<typeof saveSharing> = yield call(saveSharing, ctx, saveSharingCtx);
    const { batch } = result;

    if (batch) {
        yield put(batch);
    }

    return dashboardSharingChanged(ctx, cmd.payload.newShareProps, cmd.correlationId);
}
