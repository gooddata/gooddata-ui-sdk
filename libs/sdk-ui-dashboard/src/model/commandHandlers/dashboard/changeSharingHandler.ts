// (C) 2021-2023 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import {
    isFilterContext,
    IDashboard,
    IDashboardDefinition,
    isGranularAccessGrantee,
    ObjRef,
} from "@gooddata/sdk-model";

import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeSharing } from "../../commands/index.js";
import { DashboardSharingChanged, dashboardSharingChanged } from "../../events/dashboard.js";
import { selectDashboardRef, selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { metaActions } from "../../store/meta/index.js";
import { BatchAction, batchActions } from "redux-batched-actions";
import { invariant } from "ts-invariant";
import isEmpty from "lodash/isEmpty.js";
import { loadDashboardPermissions } from "./initializeDashboardHandler/loadDashboardPermissions.js";
import { dashboardPermissionsActions } from "../../store/dashboardPermissions/index.js";

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

function getDashboard(ctx: DashboardContext, dashboardRef: ObjRef): Promise<IDashboard> {
    return ctx.backend.workspace(ctx.workspace).dashboards().getDashboard(dashboardRef);
}

function changeGrantees(ctx: DashboardContext, saveSharingCtx: DashboardSaveSharingContext): Promise<void> {
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
    const updatedDashboardPermissions: SagaReturnType<typeof loadDashboardPermissions> = yield call(
        loadDashboardPermissions,
        ctx,
    );
    const setDashboardPermissionsAction =
        dashboardPermissionsActions.setDashboardPermissions(updatedDashboardPermissions);

    let dashboard: IDashboard;
    if (updatedDashboardPermissions.canViewDashboard) {
        if (!ctx.backend.capabilities.supportsGranularAccessControl) {
            // update dashboard with specified share status
            dashboard = yield call(updateDashboard, ctx, saveSharingCtx);
        } else {
            // get dashboard with computed share status from backend
            dashboard = yield call(getDashboard, ctx, saveSharingCtx.persistedDashboard.ref);
        }
    } else {
        dashboard = saveSharingCtx.persistedDashboard;
    }

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
     * for further operations to avoid UI inconsistencies.
     */
    const updatedDashboardProperties = {
        ...cmd.payload.newSharingProperties,
        shareStatus: dashboard.shareStatus,
    };

    return dashboardSharingChanged(ctx, updatedDashboardProperties, cmd.correlationId);
}
