// (C) 2021-2022 GoodData Corporation
import { DashboardContext } from "../../types/commonTypes";
import { SaveDashboard } from "../../commands";
import { SagaIterator } from "redux-saga";
import { selectBasicLayout } from "../../store/layout/layoutSelectors";
import { call, put, SagaReturnType, select, setContext } from "redux-saga/effects";
import {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
} from "../../store/filterContext/filterContextSelectors";
import { selectDashboardDescriptor, selectPersistedDashboard } from "../../store/meta/metaSelectors";
import { selectDateFilterConfigOverrides } from "../../store/dateFilterConfig/dateFilterConfigSelectors";
import {
    IDashboardObjectIdentity,
    IDashboard,
    IDashboardDefinition,
    IAccessControlAware,
} from "@gooddata/sdk-model";
import { BatchAction, batchActions } from "redux-batched-actions";
import { PromiseFnReturnType } from "../../types/sagas";
import { DashboardSaved, dashboardSaved } from "../../events/dashboard";
import { metaActions } from "../../store/meta";
import { filterContextActions } from "../../store/filterContext";
import { dashboardFilterContextIdentity } from "../../../_staging/dashboard/dashboardFilterContext";
import { invariant } from "ts-invariant";
import {
    dashboardLayoutRemoveIdentity,
    dashboardLayoutWidgetIdentityMap,
} from "../../../_staging/dashboard/dashboardLayout";
import { isTemporaryIdentity } from "../../utils/dashboardItemUtils";
import { layoutActions } from "../../store/layout";
import { savingActions } from "../../store/saving";
import { selectSettings } from "../../store/config/configSelectors";
import { selectBackendCapabilities } from "../../store/backendCapabilities/backendCapabilitiesSelectors";

type DashboardSaveContext = {
    cmd: SaveDashboard;
    /**
     * This contains definition of dashboard that reflects the current state.
     */
    dashboardFromState: IDashboardDefinition;

    /**
     * This contains definition that should be used during save. This is based on the `dashboardFromState` but
     * has one distinction: there will be no widgets that have the temporary identity assigned. All such
     * widgets will have the identity cleared up; this is essential for the backend SPI create/updateDashboard
     * methods to know which widgets are new.
     */
    dashboardToSave: IDashboardDefinition;

    /**
     * Dashboard as it is saved on the backend.
     *
     * This will be undefined if a dashboard is not yet saved.
     */
    persistedDashboard?: IDashboard;
};

type DashboardSaveResult = {
    batch: BatchAction;
    dashboard: IDashboard;
};

type DashboardSaveFn = (ctx: DashboardContext, saveCtx: DashboardSaveContext) => Promise<IDashboard>;

function createDashboard(ctx: DashboardContext, saveCtx: DashboardSaveContext): Promise<IDashboard> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createDashboard(saveCtx.dashboardToSave);
}

function updateDashboard(ctx: DashboardContext, saveCtx: DashboardSaveContext): Promise<IDashboard> {
    const { persistedDashboard, dashboardToSave } = saveCtx;
    invariant(persistedDashboard);

    return ctx.backend
        .workspace(ctx.workspace)
        .dashboards()
        .updateDashboard(persistedDashboard, dashboardToSave);
}

export function getDashboardWithSharing(
    dashboard: IDashboardDefinition,
    sharingEnabled: boolean = false,
    sharingSupported: boolean = true,
    isNewDashboard: boolean,
): IDashboardDefinition {
    let shareProp: Partial<IAccessControlAware> = {};
    if (isNewDashboard) {
        const { isUnderStrictControl: _unusedIsUnderStrictControl, ...dashboardRest } = dashboard;
        shareProp =
            sharingEnabled && sharingSupported
                ? {
                      shareStatus: "private",
                      isUnderStrictControl: true,
                  }
                : {
                      shareStatus: "public",
                  };
        return {
            ...dashboardRest,
            ...shareProp,
        };
    }
    return dashboard;
}

/*
 * TODO: custom widget persistence; we need a new backend capability that indicates whether the
 *  backend can persist custom widget content (tiger can already, bear cannot). Based on that
 *  capability, this code should use either the selectBasicLayout (that strips any custom widgets) or
 *  selectLayout (that keeps custom widgets).
 */
function* createDashboardSaveContext(
    cmd: SaveDashboard,
    isNewDashboard: boolean,
): SagaIterator<DashboardSaveContext> {
    const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );
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
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const capabilities: ReturnType<typeof selectBackendCapabilities> = yield select(
        selectBackendCapabilities,
    );

    /*
     * When updating an existing dashboard, the services expect that the dashboard definition to use for
     * updating contains the identity of the existing dashboard.
     *
     * It's ok to have no identity when creating a new dashboard - it will be assigned during the save.
     */
    const dashboardIdentity: Partial<IDashboardObjectIdentity> = {
        ref: persistedDashboard?.ref,
        uri: persistedDashboard?.uri,
        identifier: persistedDashboard?.identifier,
    };

    const pluginsProp = persistedDashboard?.plugins ? { plugins: persistedDashboard.plugins } : {};

    const dashboardFromState: IDashboardDefinition = {
        type: "IDashboard",
        ...dashboardDescriptor,
        title: cmd.payload.title ?? dashboardDescriptor.title,
        ...dashboardIdentity,
        filterContext: {
            ...filterContextIdentity,
            ...filterContextDefinition,
        },
        layout,
        dateFilterConfig,
        ...pluginsProp,
    };

    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        layout: dashboardLayoutRemoveIdentity(layout, isTemporaryIdentity),
    };

    return {
        cmd,
        persistedDashboard,
        dashboardFromState,
        dashboardToSave: getDashboardWithSharing(
            dashboardToSave,
            settings.enableAnalyticalDashboardPermissions,
            capabilities.supportsAccessControl,
            isNewDashboard,
        ),
    };
}

function* save(
    ctx: DashboardContext,
    saveCtx: DashboardSaveContext,
    saveFn: DashboardSaveFn,
    saveActionName: string,
): SagaIterator<DashboardSaveResult> {
    const dashboard: PromiseFnReturnType<typeof saveFn> = yield call(saveFn, ctx, saveCtx);

    /*
     * The crucial thing to do after the save is to update the identities of different objects that are stored
     * in the dashboard state and either:
     *
     * 1.  have no identity (such as dashboard itself or filter context in case of new dashboards)
     * 2.  or have temporary identity (such as KPI and Insight widgets in case of any dashboard that gets
     *     modified with new content).
     *
     * The first task is easy. The second requires additional processing to identify mapping between
     * temporary identity and persistent identity and then update the layout state accordingly.
     */
    const identityMapping = dashboardLayoutWidgetIdentityMap(
        saveCtx.dashboardFromState.layout!,
        dashboard.layout!,
    );

    const batch = batchActions(
        [
            metaActions.setMeta({ dashboard }),
            filterContextActions.updateFilterContextIdentity({
                filterContextIdentity: dashboardFilterContextIdentity(dashboard),
            }),
            layoutActions.updateWidgetIdentities(identityMapping),
            layoutActions.clearLayoutHistory(),
        ],
        saveActionName,
    );

    return {
        batch,
        dashboard,
    };
}

export function* saveDashboardHandler(
    ctx: DashboardContext,
    cmd: SaveDashboard,
): SagaIterator<DashboardSaved> {
    try {
        yield put(savingActions.setSavingStart());

        const persistedDashboard: ReturnType<typeof selectPersistedDashboard> = yield select(
            selectPersistedDashboard,
        );

        const isNewDashboard = persistedDashboard === undefined;

        const saveCtx: SagaReturnType<typeof createDashboardSaveContext> = yield call(
            createDashboardSaveContext,
            cmd,
            isNewDashboard,
        );
        let result: DashboardSaveResult;

        if (isNewDashboard) {
            result = yield call(save, ctx, saveCtx, createDashboard, "@@GDC.DASH.SAVE_NEW");
        } else {
            result = yield call(save, ctx, saveCtx, updateDashboard, "@@GDC.DASH.SAVE_EXISTING");
        }

        const { dashboard, batch } = result;

        yield put(batch);

        if (isNewDashboard) {
            yield setContext({
                dashboardContext: {
                    ...ctx,
                    dashboardRef: dashboard.ref,
                },
            });
        }

        yield put(savingActions.setSavingSuccess());
        return dashboardSaved(ctx, dashboard, isNewDashboard, cmd.correlationId);
    } catch (e: any) {
        yield put(savingActions.setSavingError(e));
        throw e;
    }
}
