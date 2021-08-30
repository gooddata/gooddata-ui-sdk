// (C) 2021 GoodData Corporation

import { IDashboard, IDashboardDefinition } from '@gooddata/sdk-backend-spi';
import { BatchAction, batchActions } from 'redux-batched-actions';
import { SagaIterator } from 'redux-saga';
import { call, put, SagaReturnType, select } from 'redux-saga/effects';
import {
    DashboardContext,
    DashboardCopySaved,
    SaveDashboardAs,
    selectBasicLayout,
    selectDateFilterConfigOverrides,
    selectFilterContextDefinition
} from '../..';
import { dashboardFilterContextIdentity } from '../../../_staging/dashboard/dashboardFilterContext';
import {
    dashboardLayoutRemoveIdentity,
    dashboardLayoutWidgetIdentityMap
} from '../../../_staging/dashboard/dashboardLayout';
import { dashboardCopySaved } from '../../events/dashboard';
import { filterContextActions } from '../../state/filterContext';
import { layoutActions } from '../../state/layout';
import { metaActions } from '../../state/meta';
import { selectDashboardDescriptor } from '../../state/meta/metaSelectors';
import { PromiseFnReturnType } from '../../types/sagas';

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
    batch: BatchAction;
    dashboard: IDashboard;
};

function createDashboard(ctx: DashboardContext, saveAsCtx: DashboardSaveAsContext): Promise<IDashboard> {
    return ctx.backend.workspace(ctx.workspace).dashboards().createDashboard(saveAsCtx.dashboardToSave);
}

function* createDashboardSaveAsContext(cmd: SaveDashboardAs): SagaIterator<DashboardSaveAsContext> {
    const {title} = cmd.payload;
    const titleProp = title ? { title } : {};
    const dashboardDescriptor: ReturnType<typeof selectDashboardDescriptor> = yield select(
        selectDashboardDescriptor,
    );
    const filterContextDefinition: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );
    const layout: ReturnType<typeof selectBasicLayout> = yield select(selectBasicLayout);
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfigOverrides> = yield select(
        selectDateFilterConfigOverrides,
    );

    const dashboardFromState: IDashboardDefinition = {
        ...dashboardDescriptor,
        filterContext: {
            ...filterContextDefinition,
        },
        layout,
        dateFilterConfig,
    };

    const dashboardToSave: IDashboardDefinition = {
        ...dashboardFromState,
        ...titleProp,
        layout: dashboardLayoutRemoveIdentity(layout, () => true),
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
    const dashboard: PromiseFnReturnType<typeof createDashboard> = yield call(createDashboard, ctx, saveAsCtx);
    const identityMapping = dashboardLayoutWidgetIdentityMap(
        saveAsCtx.dashboardFromState.layout!,
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
    const saveAsCtx: SagaReturnType<typeof createDashboardSaveAsContext> = yield call(
        createDashboardSaveAsContext,
        cmd,
    );
    const result: SagaReturnType<typeof saveAs> = yield call(saveAs, ctx, saveAsCtx);
    const { dashboard, batch } = result;

    yield put(batch);

    return dashboardCopySaved(ctx, dashboard, cmd.correlationId);
}
