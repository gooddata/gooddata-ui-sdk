// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { IDashboard, IDashboardDefinition, IDashboardObjectIdentity } from "@gooddata/sdk-backend-spi";

import { DashboardContext } from "../../types/commonTypes";
import { ChangeSharing } from "../../commands";
import { DashboardSharingChanged, dashboardSharingChanged } from "../../events/dashboard";
import {
    selectDashboardDescriptor,
    selectDashboardRef,
    selectPersistedDashboard,
} from "../../store/meta/metaSelectors";
import {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
} from "../../store/filterContext/filterContextSelectors";
import { selectBasicLayout } from "../../store/layout/layoutSelectors";
import { selectDateFilterConfigOverrides } from "../../store/dateFilterConfig/dateFilterConfigSelectors";
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
    const { newShareStatus } = cmd.payload;
    const shareProp = { shareStatus: newShareStatus };

    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );
    invariant(persistedDashboard, "Cant change sharing of unsaved dashboard");
    const dashboardIdentity: Partial<IDashboardObjectIdentity> = {
        ref: persistedDashboard?.ref,
        uri: persistedDashboard?.uri,
        identifier: persistedDashboard?.identifier,
    };
    const dashboardDescriptor: ReturnType<typeof selectDashboardDescriptor> = yield select(
        selectDashboardDescriptor,
    );
    const filterContextDefinition: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );
    const filterContextIdentity: ReturnType<typeof selectFilterContextIdentity> = yield select(
        selectFilterContextIdentity,
    );
    const layout: ReturnType<typeof selectBasicLayout> = yield select(selectBasicLayout);
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfigOverrides> = yield select(
        selectDateFilterConfigOverrides,
    );

    const dashboardFromState: IDashboardDefinition = {
        type: "IDashboard",
        ...dashboardDescriptor,
        ...dashboardIdentity,
        filterContext: {
            ...filterContextDefinition,
            ...filterContextIdentity,
        },
        layout,
        dateFilterConfig,
    };
    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        ...shareProp,
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
    const { dashboard, batch } = result;

    if (batch) {
        yield put(batch);
    }

    return dashboardSharingChanged(ctx, dashboard.shareStatus, cmd.correlationId);
}
