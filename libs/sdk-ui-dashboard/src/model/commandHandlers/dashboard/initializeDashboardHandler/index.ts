// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { InitializeDashboard } from "../../../commands/dashboard";
import { DashboardInitialized, dashboardInitialized } from "../../../events/dashboard";
import { insightsActions } from "../../../state/insights";
import { loadingActions } from "../../../state/loading";
import { DashboardContext } from "../../../types/commonTypes";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { resolveDashboardConfig } from "./resolveDashboardConfig";
import { configActions } from "../../../state/config";
import { PromiseFnReturnType } from "../../../types/sagas";
import { dateFilterConfigActions } from "../../../state/dateFilterConfig";
import { DateFilterMergeResult, mergeDateFilterConfigWithOverrides } from "./mergeDateFilterConfigs";
import { resolvePermissions } from "./resolvePermissions";
import { permissionsActions } from "../../../state/permissions";
import { loadCatalog } from "./loadCatalog";
import { loadDashboardAlerts } from "./loadDashboardAlerts";
import { catalogActions } from "../../../state/catalog";
import { alertsActions } from "../../../state/alerts";
import { BatchAction, batchActions } from "redux-batched-actions";
import { loadUser } from "./loadUser";
import { userActions } from "../../../state/user";
import { loadDashboardList } from "./loadDashboardList";
import { listedDashboardsActions } from "../../../state/listedDashboards";
import { backendCapabilitiesActions } from "../../../state/backendCapabilities";
import { ObjRef } from "@gooddata/sdk-model";
import {
    actionsToInitializeExistingDashboard,
    actionsToInitializeNewDashboard,
} from "../common/stateInitializers";
import { executionResultsActions } from "../../../state/executionResults";

function loadDashboardFromBackend(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
): Promise<IDashboardWithReferences> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardWithReferences(dashboardRef);
}

type DashboardLoadResult = {
    batch: BatchAction;
    event: DashboardInitialized;
};

function* loadExistingDashboard(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
    dashboardRef: ObjRef,
): SagaIterator<DashboardLoadResult> {
    const { backend } = ctx;

    const [dashboardWithReferences, config, permissions, catalog, alerts, user, listedDashboards]: [
        PromiseFnReturnType<typeof loadDashboardFromBackend>,
        SagaReturnType<typeof resolveDashboardConfig>,
        SagaReturnType<typeof resolvePermissions>,
        PromiseFnReturnType<typeof loadCatalog>,
        PromiseFnReturnType<typeof loadDashboardAlerts>,
        PromiseFnReturnType<typeof loadUser>,
        PromiseFnReturnType<typeof loadDashboardList>,
    ] = yield all([
        call(loadDashboardFromBackend, ctx, dashboardRef),
        call(resolveDashboardConfig, ctx, cmd),
        call(resolvePermissions, ctx, cmd),
        call(loadCatalog, ctx),
        call(loadDashboardAlerts, ctx),
        call(loadUser, ctx),
        call(loadDashboardList, ctx),
    ]);

    const {
        dashboard,
        references: { insights },
    } = dashboardWithReferences;

    const effectiveDateFilterConfig: DateFilterMergeResult = yield call(
        mergeDateFilterConfigWithOverrides,
        ctx,
        cmd,
        config.dateFilterConfig!,
        dashboard.dateFilterConfig,
    );

    const batch: BatchAction = batchActions(
        [
            backendCapabilitiesActions.setBackendCapabilities(backend.capabilities),
            configActions.setConfig(config),
            userActions.setUser(user),
            permissionsActions.setPermissions(permissions),
            catalogActions.setCatalogItems({
                attributes: catalog.attributes(),
                dateDatasets: catalog.dateDatasets(),
                facts: catalog.facts(),
                measures: catalog.measures(),
            }),
            ...actionsToInitializeExistingDashboard(
                dashboard,
                insights,
                config.settings,
                effectiveDateFilterConfig.config,
            ),
            alertsActions.setAlerts(alerts),
            insightsActions.setInsights(insights),
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: dashboard.dateFilterConfig,
                effectiveDateFilterConfig: effectiveDateFilterConfig.config,
                isUsingDashboardOverrides: effectiveDateFilterConfig.source === "dashboard",
            }),
            listedDashboardsActions.setListedDashboards(listedDashboards),
        ],
        "@@GDC.DASH/BATCH.INIT.EXISTING",
    );
    const event = dashboardInitialized(ctx, dashboard, insights, config, permissions, cmd.correlationId);

    return {
        batch,
        event,
    };
}

function* initializeNewDashboard(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
): SagaIterator<DashboardLoadResult> {
    const { backend } = ctx;

    const [config, permissions, catalog, user, listedDashboards]: [
        SagaReturnType<typeof resolveDashboardConfig>,
        SagaReturnType<typeof resolvePermissions>,
        PromiseFnReturnType<typeof loadCatalog>,
        PromiseFnReturnType<typeof loadUser>,
        PromiseFnReturnType<typeof loadDashboardList>,
    ] = yield all([
        call(resolveDashboardConfig, ctx, cmd),
        call(resolvePermissions, ctx, cmd),
        call(loadCatalog, ctx),
        call(loadUser, ctx),
        call(loadDashboardList, ctx),
    ]);

    const batch: BatchAction = batchActions(
        [
            backendCapabilitiesActions.setBackendCapabilities(backend.capabilities),
            configActions.setConfig(config),
            userActions.setUser(user),
            permissionsActions.setPermissions(permissions),
            catalogActions.setCatalogItems({
                attributes: catalog.attributes(),
                dateDatasets: catalog.dateDatasets(),
                facts: catalog.facts(),
                measures: catalog.measures(),
            }),
            listedDashboardsActions.setListedDashboards(listedDashboards),
            executionResultsActions.clearAllExecutionResults(),
            ...actionsToInitializeNewDashboard(config.dateFilterConfig),
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: undefined,
                effectiveDateFilterConfig: config.dateFilterConfig,
                isUsingDashboardOverrides: false,
            }),
        ],
        "@@GDC.DASH/BATCH.INIT.NEW",
    );
    const event = dashboardInitialized(ctx, undefined, [], config, permissions, cmd.correlationId);

    return {
        batch,
        event,
    };
}

export function* initializeDashboardHandler(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
): SagaIterator<DashboardInitialized> {
    const { dashboardRef } = ctx;
    try {
        yield put(loadingActions.setLoadingStart());

        let result: DashboardLoadResult;

        if (dashboardRef) {
            result = yield call(loadExistingDashboard, ctx, cmd, dashboardRef);
        } else {
            result = yield call(initializeNewDashboard, ctx, cmd);
        }

        yield put(result.batch);
        yield put(loadingActions.setLoadingSuccess());

        return result.event;
    } catch (e) {
        yield put(loadingActions.setLoadingError(e.message));

        throw e;
    }
}
