// (C) 2021-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import {
    isFilterContext,
    IDashboard,
    IDashboardDefinition,
    isGranularAccessGrantee,
} from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes";
import { ChangeSharing } from "../../commands";
import { DashboardSharingChanged, dashboardSharingChanged } from "../../events/dashboard";
import { selectDashboardRef, selectPersistedDashboard } from "../../store/meta/metaSelectors";
import { invalidArgumentsProvided } from "../../events/general";
import { metaActions } from "../../store/meta";
import { BatchAction, batchActions } from "redux-batched-actions";
import { PromiseFnReturnType } from "../../types/sagas";
import invariant from "ts-invariant";
import isEmpty from "lodash/isEmpty";
import { loadDashboardPermissions } from "./initializeDashboardHandler/loadDashboardPermissions";
import { dashboardPermissionsActions } from "../../store/dashboardPermissions";

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
    const { newSharingProperties } = cmd.payload;

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
        shareStatus: newSharingProperties.shareStatus,
        isLocked: newSharingProperties.isLocked,
        isUnderStrictControl: newSharingProperties.isUnderStrictControl,
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

function changeGrantees(ctx: DashboardContext, saveSharingCtx: DashboardSaveSharingContext): Promise<any> {
    const { granteesToAdd, granteesToDelete } = saveSharingCtx.cmd.payload.newSharingProperties;
    const grantees = [...granteesToAdd, ...granteesToDelete].filter(isGranularAccessGrantee);

    return ctx.backend.workspace(ctx.workspace).accessControl().changeAccess(ctx.dashboardRef!, grantees);
}

type DashboardSaveSharingResult = {
    batch?: BatchAction;
    dashboard: IDashboard;
};

function* saveSharing(
    ctx: DashboardContext,
    saveSharingCtx: DashboardSaveSharingContext,
): SagaIterator<DashboardSaveSharingResult> {
    const { granteesToAdd, granteesToDelete } = saveSharingCtx.cmd.payload.newSharingProperties;
    const grantees = [...granteesToAdd, ...granteesToDelete].filter(isGranularAccessGrantee);

    if (!isEmpty(grantees)) {
        yield call(changeGrantees, ctx, saveSharingCtx);
    }
    // get up-to-date permissions from backend
    const updatedDashboardPermissions = yield call(loadDashboardPermissions, ctx);
    const setDashboardPermissionsAction =
        dashboardPermissionsActions.setDashboardPermissions(updatedDashboardPermissions);

    const dashboard: PromiseFnReturnType<typeof updateDashboard> = yield call(
        updateDashboard,
        ctx,
        saveSharingCtx,
    );
    const setDashboardMetaAction = metaActions.setMeta({ dashboard });

    const batch = batchActions(
        [setDashboardMetaAction, setDashboardPermissionsAction],
        "@@GDC.DASH.SAVE_SHARING",
    );

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
    const { batch, dashboard } = result;

    if (batch) {
        yield put(batch);
    }

    /**
     * BE might evaluate that share status has changed for the dashboard. When this happens, we want to use the new share status
     * for further operations to avoid UI inconsistensies.
     */
    const updatedDashboardProperties = {
        ...cmd.payload.newSharingProperties,
        shareStatus: dashboard.shareStatus,
    };

    return dashboardSharingChanged(ctx, dashboardRef, updatedDashboardProperties, cmd.correlationId);
}
