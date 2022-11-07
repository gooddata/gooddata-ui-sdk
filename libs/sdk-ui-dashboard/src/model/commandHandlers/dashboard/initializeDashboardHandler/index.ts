// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { InitializeDashboard } from "../../../commands/dashboard";
import { DashboardInitialized, dashboardInitialized } from "../../../events/dashboard";
import { insightsActions } from "../../../store/insights";
import { loadingActions } from "../../../store/loading";
import {
    DashboardContext,
    PrivateDashboardContext,
    ResolvedDashboardConfig,
} from "../../../types/commonTypes";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { resolveDashboardConfig } from "./resolveDashboardConfig";
import { configActions } from "../../../store/config";
import { PromiseFnReturnType } from "../../../types/sagas";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig";
import { DateFilterMergeResult, mergeDateFilterConfigWithOverrides } from "./mergeDateFilterConfigs";
import { resolvePermissions } from "./resolvePermissions";
import { permissionsActions } from "../../../store/permissions";
import { loadCatalog } from "./loadCatalog";
import { loadDashboardAlerts } from "./loadDashboardAlerts";
import { catalogActions } from "../../../store/catalog";
import { alertsActions } from "../../../store/alerts";
import { BatchAction, batchActions } from "redux-batched-actions";
import { loadUser } from "./loadUser";
import { userActions } from "../../../store/user";
import { uiActions } from "../../../store/ui";
import { renderModeActions } from "../../../store/renderMode";
import { loadDashboardList } from "./loadDashboardList";
import { listedDashboardsActions } from "../../../store/listedDashboards";
import { backendCapabilitiesActions } from "../../../store/backendCapabilities";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import {
    actionsToInitializeExistingDashboard,
    actionsToInitializeNewDashboard,
} from "../common/stateInitializers";
import { executionResultsActions } from "../../../store/executionResults";
import { createDisplayFormMapFromCatalog } from "../../../../_staging/catalog/displayFormMap";
import { getPrivateContext } from "../../../store/_infra/contexts";
import { accessibleDashboardsActions } from "../../../store/accessibleDashboards";
import { loadAccessibleDashboardList } from "./loadAccessibleDashboardList";
import { loadLegacyDashboards } from "./loadLegacyDashboards";
import { legacyDashboardsActions } from "../../../store/legacyDashboards";
import { validateDrills } from "../../common/validateDrills";

function loadDashboardFromBackend(
    ctx: DashboardContext,
    privateCtx: PrivateDashboardContext,
    dashboardRef: ObjRef,
): Promise<IDashboardWithReferences> {
    const { backend, workspace, filterContextRef } = ctx;
    const { preloadedDashboard } = privateCtx;

    if (preloadedDashboard && areObjRefsEqual(preloadedDashboard.ref, dashboardRef)) {
        return backend
            .workspace(workspace)
            .dashboards()
            .getDashboardReferencedObjects(preloadedDashboard, ["insight"])
            .then((references) => {
                return {
                    dashboard: preloadedDashboard,
                    references,
                };
            });
    }

    return backend
        .workspace(workspace)
        .dashboards()
        .getDashboardWithReferences(dashboardRef, filterContextRef, { loadUserData: true }, ["insight"]);
}

type DashboardLoadResult = {
    batch: BatchAction;
    event: DashboardInitialized;
    config: ResolvedDashboardConfig;
};

function* loadExistingDashboard(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
    dashboardRef: ObjRef,
): SagaIterator<DashboardLoadResult> {
    const { backend } = ctx;
    const privateCtx: PrivateDashboardContext = yield call(getPrivateContext);

    const [
        dashboardWithReferences,
        config,
        permissions,
        catalog,
        alerts,
        user,
        listedDashboards,
        accessibleDashboards,
        legacyDashboards,
    ]: [
        PromiseFnReturnType<typeof loadDashboardFromBackend>,
        SagaReturnType<typeof resolveDashboardConfig>,
        SagaReturnType<typeof resolvePermissions>,
        PromiseFnReturnType<typeof loadCatalog>,
        PromiseFnReturnType<typeof loadDashboardAlerts>,
        PromiseFnReturnType<typeof loadUser>,
        PromiseFnReturnType<typeof loadDashboardList>,
        PromiseFnReturnType<typeof loadAccessibleDashboardList>,
        PromiseFnReturnType<typeof loadLegacyDashboards>,
    ] = yield all([
        call(loadDashboardFromBackend, ctx, privateCtx, dashboardRef),
        call(resolveDashboardConfig, ctx, cmd),
        call(resolvePermissions, ctx, cmd),
        call(loadCatalog, ctx),
        call(loadDashboardAlerts, ctx),
        call(loadUser, ctx),
        call(loadDashboardList, ctx),
        call(loadAccessibleDashboardList, ctx),
        call(loadLegacyDashboards, ctx),
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

    const initActions: SagaReturnType<typeof actionsToInitializeExistingDashboard> = yield call(
        actionsToInitializeExistingDashboard,
        ctx,
        dashboard,
        insights,
        config.settings,
        effectiveDateFilterConfig.config,
        createDisplayFormMapFromCatalog(catalog),
        cmd.payload.persistedDashboard,
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
            ...initActions,
            alertsActions.setAlerts(alerts),
            insightsActions.setInsights(insights),
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: dashboard.dateFilterConfig,
                effectiveDateFilterConfig: effectiveDateFilterConfig.config,
                isUsingDashboardOverrides: effectiveDateFilterConfig.source === "dashboard",
            }),
            listedDashboardsActions.setListedDashboards(listedDashboards),
            accessibleDashboardsActions.setAccessibleDashboards(accessibleDashboards),
            legacyDashboardsActions.setLegacyDashboards(legacyDashboards),
            uiActions.setMenuButtonItemsVisibility(config.menuButtonItemsVisibility),
            renderModeActions.setRenderMode(config.initialRenderMode),
        ],
        "@@GDC.DASH/BATCH.INIT.EXISTING",
    );
    const event = dashboardInitialized(ctx, dashboard, insights, config, permissions, cmd.correlationId);

    return {
        batch,
        event,
        config,
    };
}

function* initializeNewDashboard(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
): SagaIterator<DashboardLoadResult> {
    const { backend } = ctx;

    const [config, permissions, catalog, user, listedDashboards, accessibleDashboards, legacyDashboards]: [
        SagaReturnType<typeof resolveDashboardConfig>,
        SagaReturnType<typeof resolvePermissions>,
        PromiseFnReturnType<typeof loadCatalog>,
        PromiseFnReturnType<typeof loadUser>,
        PromiseFnReturnType<typeof loadDashboardList>,
        PromiseFnReturnType<typeof loadAccessibleDashboardList>,
        PromiseFnReturnType<typeof loadLegacyDashboards>,
    ] = yield all([
        call(resolveDashboardConfig, ctx, cmd),
        call(resolvePermissions, ctx, cmd),
        call(loadCatalog, ctx),
        call(loadUser, ctx),
        call(loadDashboardList, ctx),
        call(loadAccessibleDashboardList, ctx),
        call(loadLegacyDashboards, ctx),
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
            accessibleDashboardsActions.setAccessibleDashboards(accessibleDashboards),
            legacyDashboardsActions.setLegacyDashboards(legacyDashboards),
            executionResultsActions.clearAllExecutionResults(),
            ...actionsToInitializeNewDashboard(config.dateFilterConfig),
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: undefined,
                effectiveDateFilterConfig: config.dateFilterConfig,
                isUsingDashboardOverrides: false,
            }),
            uiActions.setMenuButtonItemsVisibility(config.menuButtonItemsVisibility),
            renderModeActions.setRenderMode(config.initialRenderMode),
        ],
        "@@GDC.DASH/BATCH.INIT.NEW",
    );
    const event = dashboardInitialized(ctx, undefined, [], config, permissions, cmd.correlationId);

    return {
        batch,
        event,
        config,
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

        if (result.config.initialRenderMode === "edit" && dashboardRef) {
            yield call(validateDrills, ctx, cmd);
        }

        yield put(loadingActions.setLoadingSuccess());

        return result.event;
    } catch (e) {
        yield put(loadingActions.setLoadingError(e));

        throw e;
    }
}
