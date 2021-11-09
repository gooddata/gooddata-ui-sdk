// (C) 2021 GoodData Corporation

import { IAccessControlAware, IDashboard, IDashboardDefinition } from "@gooddata/sdk-backend-spi";
import { BatchAction, batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { call, put, SagaReturnType, select, setContext } from "redux-saga/effects";
import { dashboardFilterContextIdentity } from "../../../_staging/dashboard/dashboardFilterContext";
import {
    dashboardLayoutRemoveIdentity,
    dashboardLayoutWidgetIdentityMap,
} from "../../../_staging/dashboard/dashboardLayout";
import { SaveDashboardAs } from "../../commands/dashboard";
import { DashboardCopySaved, dashboardCopySaved } from "../../events/dashboard";
import { filterContextActions } from "../../store/filterContext";
import { selectFilterContextDefinition } from "../../store/filterContext/filterContextSelectors";
import { layoutActions } from "../../store/layout";
import { selectBasicLayout } from "../../store/layout/layoutSelectors";
import { metaActions } from "../../store/meta";
import {
    selectDashboardDescriptor,
    selectPersistedDashboard,
    selectPersistedDashboardFilterContext,
} from "../../store/meta/metaSelectors";
import { DashboardContext } from "../../types/commonTypes";
import { PromiseFnReturnType } from "../../types/sagas";
import { selectDateFilterConfigOverrides } from "../../store/dateFilterConfig/dateFilterConfigSelectors";
import { alertsActions } from "../../store/alerts";
import { savingActions } from "../../store/saving";
import { selectSettings } from "../../store/config/configSelectors";
import { selectBackendCapabilities } from "../../store/backendCapabilities/backendCapabilitiesSelectors";

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

    const dashboardDescriptor: ReturnType<typeof selectDashboardDescriptor> = yield select(
        selectDashboardDescriptor,
    );

    const originalDashboardDescription: ReturnType<typeof selectPersistedDashboard> = yield select(
        selectPersistedDashboard,
    );

    const filterContextDefinition: ReturnType<typeof selectFilterContextDefinition> = yield select(
        !useOriginalFilterContext || !originalDashboardDescription
            ? selectFilterContextDefinition
            : selectPersistedDashboardFilterContext,
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

    if (!saveAsCtx.cmd.payload.switchToCopy) {
        return {
            dashboard,
        };
    }

    const identityMapping = dashboardLayoutWidgetIdentityMap(
        saveAsCtx.dashboardFromState.layout!,
        dashboard.layout!,
    );

    const batch = batchActions(
        [
            metaActions.setMeta({ dashboard }),
            alertsActions.setAlerts([]),
            filterContextActions.updateFilterContextIdentity({
                filterContextIdentity: dashboardFilterContextIdentity(dashboard),
            }),
            layoutActions.updateWidgetIdentities(identityMapping),
            layoutActions.clearLayoutHistory(),
        ],
        "@@GDC.DASH.SAVE_AS",
    );

    return {
        batch,
        dashboard,
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

        let context: DashboardContext = ctx;

        if (switchToCopy) {
            context = {
                ...ctx,
                dashboardRef: dashboard.ref,
            };

            yield setContext({
                dashboardContext: context,
            });
        }

        yield put(savingActions.setSavingSuccess());
        return dashboardCopySaved(context, dashboard, cmd.correlationId);
    } catch (e: any) {
        yield put(savingActions.setSavingError(e));
        throw e;
    }
}
