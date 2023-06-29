// (C) 2021-2023 GoodData Corporation

import { IDashboard, IDashboardDefinition, IAccessControlAware } from "@gooddata/sdk-model";
import { BatchAction, batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { dashboardFilterContextIdentity } from "../../../_staging/dashboard/dashboardFilterContext.js";
import {
    dashboardLayoutRemoveIdentity,
    dashboardLayoutWidgetIdentityMap,
} from "../../../_staging/dashboard/dashboardLayout.js";
import { SaveDashboardAs } from "../../commands/dashboard.js";
import { DashboardCopySaved, dashboardCopySaved } from "../../events/dashboard.js";
import { filterContextActions } from "../../store/filterContext/index.js";
import { selectFilterContextDefinition } from "../../store/filterContext/filterContextSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectBasicLayout } from "../../store/layout/layoutSelectors.js";
import { metaActions } from "../../store/meta/index.js";
import {
    selectDashboardDescriptor,
    selectPersistedDashboard,
    selectPersistedDashboardFilterContextAsFilterContextDefinition,
} from "../../store/meta/metaSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { selectDateFilterConfigOverrides } from "../../store/dateFilterConfig/dateFilterConfigSelectors.js";
import { alertsActions } from "../../store/alerts/index.js";
import { savingActions } from "../../store/saving/index.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectBackendCapabilities } from "../../store/backendCapabilities/backendCapabilitiesSelectors.js";
import { listedDashboardsActions } from "../../store/listedDashboards/index.js";
import { createListedDashboard } from "../../../_staging/listedDashboard/listedDashboardUtils.js";
import { accessibleDashboardsActions } from "../../store/accessibleDashboards/index.js";
import { selectCurrentUser } from "../../store/user/userSelectors.js";
import { changeRenderModeHandler } from "../renderMode/changeRenderModeHandler.js";
import { changeRenderMode } from "../../commands/index.js";
import { selectIsInViewMode } from "../../store/renderMode/renderModeSelectors.js";

type DashboardSaveAsContext = {
    cmd: SaveDashboardAs;

    /**
     * This contains definition of dashboard that reflects the current state.
     */
    dashboardFromState: IDashboardDefinition;

    /**
     * This contains definition that should be used during save as. This is based on the `dashboardFromState` but
     * has few distinctions:
     *
     * -  all widgets will have their identity cleared up; this is to ensure that new widgets will be created
     *    during `createDashboard` call
     * -  the title passed from command will be used here
     */
    dashboardToSave: IDashboardDefinition;
};

type DashboardSaveAsResult = {
    batch?: BatchAction;
    dashboard: IDashboard;
};

function createDashboard(ctx: DashboardContext, saveAsCtx: DashboardSaveAsContext): Promise<IDashboard> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createDashboard(saveAsCtx.dashboardToSave);
}

/*
 * TODO: custom widget persistence; we need a new backend capability that indicates whether the
 *  backend can persist custom widget content (tiger can already, bear cannot). Based on that
 *  capability, this code should use either the selectBasicLayout (that strips any custom widgets) or
 *  selectLayout (that keeps custom widgets).
 */
function* createDashboardSaveAsContext(cmd: SaveDashboardAs): SagaIterator<DashboardSaveAsContext> {
    const { title, useOriginalFilterContext } = cmd.payload;
    const titleProp = title ? { title } : {};

    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );

    const dashboardDescriptor: ReturnType<typeof selectDashboardDescriptor> = yield select(
        selectDashboardDescriptor,
    );

    const originalDashboardDescription: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );

    const filterContextDefinition: ReturnType<typeof selectFilterContextDefinition> = yield select(
        !useOriginalFilterContext || !originalDashboardDescription
            ? selectFilterContextDefinition
            : selectPersistedDashboardFilterContextAsFilterContextDefinition,
    );

    const layout: ReturnType<typeof selectBasicLayout> = yield select(selectBasicLayout);
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfigOverrides> = yield select(
        selectDateFilterConfigOverrides,
    );

    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const capabilities: ReturnType<typeof selectBackendCapabilities> = yield select(
        selectBackendCapabilities,
    );

    const { isUnderStrictControl: _unusedProp, ...dashboardDescriptorRest } = dashboardDescriptor;

    const dashboardFromState: IDashboardDefinition = {
        type: "IDashboard",
        ...dashboardDescriptorRest,
        filterContext: {
            ...filterContextDefinition,
        },
        layout,
        dateFilterConfig,
    };

    const pluginsProp = persistedDashboard?.plugins ? { plugins: persistedDashboard.plugins } : {};

    const shareProp: Partial<IAccessControlAware> =
        settings.enableAnalyticalDashboardPermissions && capabilities.supportsAccessControl
            ? {
                  isLocked: false,
                  shareStatus: "private",
                  isUnderStrictControl: true,
              }
            : {
                  isLocked: false,
                  shareStatus: "public",
              };

    // remove widget identity from all widgets; according to the SPI contract, this will result in
    // creation of new widgets
    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        ...titleProp,
        layout: dashboardLayoutRemoveIdentity(layout, () => true),
        ...shareProp,
        ...pluginsProp,
    };

    return {
        cmd,
        dashboardFromState,
        dashboardToSave,
    };
}

function* saveAs(
    ctx: DashboardContext,
    saveAsCtx: DashboardSaveAsContext,
): SagaIterator<DashboardSaveAsResult> {
    const dashboard: PromiseFnReturnType<typeof createDashboard> = yield call(
        createDashboard,
        ctx,
        saveAsCtx,
    );

    const user: ReturnType<typeof selectCurrentUser> = yield select(selectCurrentUser);
    // we need to set createdBy manually, because conversion userRef -> IUser in createDashboard call needs UserMap for this,
    // but to get a UserMap is expensive and we know who created the dashboard.
    const dashboardWithUser = { ...dashboard, createdBy: user };

    if (!saveAsCtx.cmd.payload.switchToCopy) {
        return {
            dashboard: dashboardWithUser,
        };
    }

    const identityMapping = dashboardLayoutWidgetIdentityMap(
        saveAsCtx.dashboardFromState.layout!,
        dashboardWithUser.layout!,
    );

    const batch = batchActions(
        [
            metaActions.setMeta({ dashboard: dashboardWithUser }),
            alertsActions.setAlerts([]),
            filterContextActions.updateFilterContextIdentity({
                filterContextIdentity: dashboardFilterContextIdentity(dashboardWithUser),
            }),
            layoutActions.updateWidgetIdentities(identityMapping),
            layoutActions.clearLayoutHistory(),
        ],
        "@@GDC.DASH.SAVE_AS",
    );

    return {
        batch,
        dashboard: dashboardWithUser,
    };
}

export function* saveAsDashboardHandler(
    ctx: DashboardContext,
    cmd: SaveDashboardAs,
): SagaIterator<DashboardCopySaved> {
    try {
        yield put(savingActions.setSavingStart());
        const saveAsCtx: SagaReturnType<typeof createDashboardSaveAsContext> = yield call(
            createDashboardSaveAsContext,
            cmd,
        );
        const {
            payload: { switchToCopy },
        } = cmd;
        const result: SagaReturnType<typeof saveAs> = yield call(saveAs, ctx, saveAsCtx);
        const { dashboard, batch } = result;

        if (batch) {
            yield put(batch);
        }

        if (switchToCopy) {
            /*
             * We must do this by mutating the context object, the setContext effect changes the context only
             * for the current saga and its children. See https://github.com/redux-saga/redux-saga/issues/1798#issuecomment-468054586
             */
            ctx.dashboardRef = dashboard.ref;
        }

        const listedDashboard = createListedDashboard(dashboard);
        yield put(listedDashboardsActions.addListedDashboard(listedDashboard));
        yield put(accessibleDashboardsActions.addAccessibleDashboard(listedDashboard));

        const isInViewMode: ReturnType<typeof selectIsInViewMode> = yield select(selectIsInViewMode);
        if (!isInViewMode) {
            yield call(changeRenderModeHandler, ctx, changeRenderMode("view", undefined, cmd.correlationId));
        }

        yield put(savingActions.setSavingSuccess());

        const isOriginalDashboardLocked = saveAsCtx.dashboardFromState.isLocked ?? false;

        return dashboardCopySaved(ctx, dashboard, isOriginalDashboardLocked, cmd.correlationId);
    } catch (e: any) {
        yield put(savingActions.setSavingError(e));
        throw e;
    }
}
