// (C) 2021-2025 GoodData Corporation

import { uniqBy } from "lodash-es";
import { BatchAction, batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { SagaReturnType, all, call, put, spawn } from "redux-saga/effects";

import { IDashboardWithReferences, IWorkspaceCatalog, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    IDashboard,
    IDashboardLayout,
    IDateHierarchyTemplate,
    IInsight,
    IWidget,
    ObjRef,
    areObjRefsEqual,
    isDrillToInsight,
    isInsightWidget,
    isVisualizationSwitcherWidget,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { loadCatalog } from "./loadCatalog.js";
import { loadDashboardList } from "./loadDashboardList.js";
import { loadDashboardPermissions } from "./loadDashboardPermissions.js";
import { loadDateHierarchyTemplates } from "./loadDateHierarchyTemplates.js";
import { loadFilterViews } from "./loadFilterViews.js";
import { loadUser } from "./loadUser.js";
import { DateFilterMergeResult, mergeDateFilterConfigWithOverrides } from "./mergeDateFilterConfigs.js";
import { preloadAttributeFiltersData as preloadAttributeFiltersDataFromBackend } from "./preloadAttributeFiltersData.js";
import { resolveDashboardConfigAndFeatureFlagDependentCalls } from "./resolveDashboardConfig.js";
import { resolveEntitlements } from "./resolveEntitlements.js";
import { resolvePermissions } from "./resolvePermissions.js";
import {
    createDisplayFormMap,
    createDisplayFormMapFromCatalog,
} from "../../../../_staging/catalog/displayFormMap.js";
import { InitializeDashboard } from "../../../commands/dashboard.js";
import { DashboardInitialized, dashboardInitialized } from "../../../events/dashboard.js";
import { getPrivateContext } from "../../../store/_infra/contexts.js";
import { accessibleDashboardsActions } from "../../../store/accessibleDashboards/index.js";
import { attributeFilterConfigsActions } from "../../../store/attributeFilterConfigs/index.js";
import { automationsActions } from "../../../store/automations/index.js";
import { backendCapabilitiesActions } from "../../../store/backendCapabilities/index.js";
import { catalogActions } from "../../../store/catalog/index.js";
import { configActions } from "../../../store/config/index.js";
import { dashboardPermissionsActions } from "../../../store/dashboardPermissions/index.js";
import { dateFilterConfigActions } from "../../../store/dateFilterConfig/index.js";
import { dateFilterConfigsActions } from "../../../store/dateFilterConfigs/index.js";
import { entitlementsActions } from "../../../store/entitlements/index.js";
import { executionResultsActions } from "../../../store/executionResults/index.js";
import { filterContextActions } from "../../../store/filterContext/index.js";
import { filterViewsActions } from "../../../store/filterViews/index.js";
import { listedDashboardsActions } from "../../../store/listedDashboards/index.js";
import { loadingActions } from "../../../store/loading/index.js";
import { notificationChannelsActions } from "../../../store/notificationChannels/index.js";
import { permissionsActions } from "../../../store/permissions/index.js";
import { renderModeActions } from "../../../store/renderMode/index.js";
import { uiActions } from "../../../store/ui/index.js";
import { userActions } from "../../../store/user/index.js";
import { DashboardContext, PrivateDashboardContext } from "../../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../../types/sagas.js";
import { applyDefaultFilterView } from "../common/filterViews.js";
import {
    actionsToInitializeExistingDashboard,
    actionsToInitializeNewDashboard,
} from "../common/stateInitializers.js";

async function loadDashboardFromBackend(
    ctx: DashboardContext,
    privateCtx: PrivateDashboardContext,
    dashboardRef: ObjRef,
    hasPersistedDashboard: boolean,
): Promise<IDashboardWithReferences> {
    const { backend, workspace, filterContextRef } = ctx;
    const { preloadedDashboard } = privateCtx;

    if (preloadedDashboard && areObjRefsEqual(preloadedDashboard.ref, dashboardRef)) {
        // with persisted dashboard we cannot use the backend for resolution of the referenced insights
        // as our version of dashboard differs from what is on the backend
        // hence we must do the resolution on the client
        if (hasPersistedDashboard) {
            if (ctx.config?.references) {
                return {
                    dashboard: preloadedDashboard,
                    references: ctx.config.references,
                };
            }

            const insights = await loadInsightsForPersistedDashboard(ctx, preloadedDashboard);
            return {
                dashboard: preloadedDashboard,
                references: {
                    insights,
                    plugins: [],
                },
            };
        }
        return backend
            .workspace(workspace)
            .dashboards()
            .getDashboardReferencedObjects(preloadedDashboard, ["insight", "dataSet"])
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
        .getDashboardWithReferences(dashboardRef, filterContextRef, { loadUserData: true }, [
            "insight",
            "dataSet",
        ]);
}

async function loadInsightsForPersistedDashboard(
    ctx: DashboardContext,
    dashboard: IDashboard | undefined,
): Promise<IInsight[]> {
    if (!dashboard) {
        return [];
    }

    const { backend, workspace } = ctx;

    const referencedInsights: ObjRef[] = [];

    const collectInsightsFromWidget = (widget: IWidget) => {
        if (isInsightWidget(widget)) {
            referencedInsights.push(
                // insight itself
                widget.insight,
                // insights in drills to insight
                ...widget.drills.filter(isDrillToInsight).map((drill) => drill.target),
            );
        }
        if (isVisualizationSwitcherWidget(widget)) {
            widget.visualizations.forEach((vis) => {
                if (isInsightWidget(vis)) {
                    referencedInsights.push(
                        // insight itself
                        vis.insight,
                        // insights in drills to insight
                        ...vis.drills.filter(isDrillToInsight).map((drill) => drill.target),
                    );
                }
            });
        }
    };

    // Walk through tabs if they exist
    if (dashboard.tabs && dashboard.tabs.length > 0) {
        dashboard.tabs.forEach((tab) => {
            if (tab.layout) {
                walkLayout(tab.layout as IDashboardLayout<IWidget>, {
                    widgetCallback: collectInsightsFromWidget,
                });
            }
        });
    }

    // Also walk through root layout for backwards compatibility or when tabs are not used
    if (dashboard.layout) {
        walkLayout(dashboard.layout as IDashboardLayout<IWidget>, {
            widgetCallback: collectInsightsFromWidget,
        });
    }

    const uniqueRefs = uniqBy(referencedInsights, serializeObjRef);

    return Promise.all(uniqueRefs.map((ref) => backend.workspace(workspace).insights().getInsight(ref)));
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
    const privateCtx: PrivateDashboardContext = yield call(getPrivateContext);

    const calls = [
        call(loadDashboardFromBackend, ctx, privateCtx, dashboardRef, !!cmd.payload.persistedDashboard),
        call(resolveDashboardConfigAndFeatureFlagDependentCalls, ctx, cmd),
        call(resolvePermissions, ctx, cmd),
        call(resolveEntitlements, ctx, cmd),
        call(loadUser, ctx),
        call(loadDashboardPermissions, ctx),
        call(loadDateHierarchyTemplates, ctx),
        call(loadFilterViews, ctx),
    ];

    const [
        dashboardWithReferences,
        {
            resolvedConfig: config,
            additionalData: { workspaceAutomationsCount, notificationChannelsCount },
        },
        permissions,
        entitlements,
        user,
        dashboardPermissions,
        dateHierarchyTemplates,
        filterViews,
    ]: [
        PromiseFnReturnType<typeof loadDashboardFromBackend>,
        SagaReturnType<typeof resolveDashboardConfigAndFeatureFlagDependentCalls>,
        SagaReturnType<typeof resolvePermissions>,
        PromiseFnReturnType<typeof resolveEntitlements>,
        PromiseFnReturnType<typeof loadUser>,
        PromiseFnReturnType<typeof loadDashboardPermissions>,
        PromiseFnReturnType<typeof loadDateHierarchyTemplates>,
        PromiseFnReturnType<typeof loadFilterViews>,
    ] = yield all(calls);

    const {
        dashboard: loadedDashboard,
        references: { insights },
    } = dashboardWithReferences;

    const dashboard = applyDefaultFilterView(loadedDashboard, filterViews, config.settings);

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
        config.settings.enableImmediateAttributeFilterDisplayAsLabelMigration ?? false,
        undefined,
        [],
        dashboard.attributeFilterConfigs,
        effectiveDateFilterConfig.config,
        createDisplayFormMap([], []),
        cmd.payload.persistedDashboard,
        cmd.payload.initialTabId,
    );

    const catalogPayload = {
        dateHierarchyTemplates,
    };

    const batch: BatchAction = batchActions(
        [
            backendCapabilitiesActions.setBackendCapabilities(backend.capabilities),
            configActions.setConfig(config),
            entitlementsActions.setEntitlements(entitlements),
            userActions.setUser(user),
            permissionsActions.setPermissions(permissions),
            catalogActions.setCatalogItems(catalogPayload),
            ...initActions,
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: dashboard.dateFilterConfig,
                effectiveDateFilterConfig: effectiveDateFilterConfig.config,
                isUsingDashboardOverrides: effectiveDateFilterConfig.source === "dashboard",
            }),
            attributeFilterConfigsActions.setAttributeFilterConfigs({
                attributeFilterConfigs: dashboard.attributeFilterConfigs,
            }),
            dateFilterConfigsActions.setDateFilterConfigs({
                dateFilterConfigs: dashboard.dateFilterConfigs,
            }),
            uiActions.setMenuButtonItemsVisibility(config.menuButtonItemsVisibility),
            renderModeActions.setRenderMode(config.initialRenderMode),
            dashboardPermissionsActions.setDashboardPermissions(dashboardPermissions),
            automationsActions.setAllAutomationsCount(workspaceAutomationsCount),
            notificationChannelsActions.setNotificationChannelsCount(notificationChannelsCount),
            filterViewsActions.setFilterViews({
                dashboard: ctx.dashboardRef!, // should be defined as we are in existing dashboard load fn
                filterViews,
            }),
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

    const [
        {
            resolvedConfig: config,
            additionalData: { notificationChannelsCount, workspaceAutomationsCount },
        },
        permissions,
        entitlements,
        catalog,
        user,
        listedDashboards,
        dateHierarchyTemplates,
    ]: [
        SagaReturnType<typeof resolveDashboardConfigAndFeatureFlagDependentCalls>,
        SagaReturnType<typeof resolvePermissions>,
        PromiseFnReturnType<typeof resolveEntitlements>,
        PromiseFnReturnType<typeof loadCatalog>,
        PromiseFnReturnType<typeof loadUser>,
        PromiseFnReturnType<typeof loadDashboardList>,
        PromiseFnReturnType<typeof loadDateHierarchyTemplates>,
    ] = yield all([
        call(resolveDashboardConfigAndFeatureFlagDependentCalls, ctx, cmd),
        call(resolvePermissions, ctx, cmd),
        call(resolveEntitlements, ctx, cmd),
        call(loadCatalog, ctx, cmd),
        call(loadUser, ctx),
        call(loadDashboardList, ctx),
        call(loadDateHierarchyTemplates, ctx),
        call(loadFilterViews, ctx),
    ]);

    const { initActions, dashboard, insights }: SagaReturnType<typeof actionsToInitializeNewDashboard> =
        yield call(
            actionsToInitializeNewDashboard,
            ctx,
            config.settings,
            config.dateFilterConfig,
            catalog ? createDisplayFormMapFromCatalog(catalog) : createDisplayFormMap([], []),
            cmd.payload.initialTabId,
        );

    const batch: BatchAction = batchActions(
        [
            backendCapabilitiesActions.setBackendCapabilities(backend.capabilities),
            configActions.setConfig(config),
            entitlementsActions.setEntitlements(entitlements),
            userActions.setUser(user),
            permissionsActions.setPermissions(permissions),
            catalogActions.setCatalogItems({
                attributes: catalog.attributes(),
                dateDatasets: catalog.dateDatasets(),
                facts: catalog.facts(),
                measures: catalog.measures(),
                attributeHierarchies: catalog.attributeHierarchies(),
                dateHierarchyTemplates: dateHierarchyTemplates,
            }),
            listedDashboardsActions.setListedDashboards(listedDashboards),
            accessibleDashboardsActions.setAccessibleDashboards(listedDashboards),
            executionResultsActions.clearAllExecutionResults(),
            ...initActions,
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: undefined,
                effectiveDateFilterConfig: config.dateFilterConfig,
                isUsingDashboardOverrides: false,
            }),
            uiActions.setMenuButtonItemsVisibility(config.menuButtonItemsVisibility),
            renderModeActions.setRenderMode(config.initialRenderMode),
            dashboardPermissionsActions.setDashboardPermissions({
                canViewDashboard: true,
                canShareDashboard: true,
                canShareLockedDashboard: true,
                canEditDashboard: true,
                canEditLockedDashboard: true,
            }),
            automationsActions.setAllAutomationsCount(workspaceAutomationsCount),
            notificationChannelsActions.setNotificationChannelsCount(notificationChannelsCount),
        ],
        "@@GDC.DASH/BATCH.INIT.NEW",
    );
    const event = dashboardInitialized(ctx, dashboard, insights, config, permissions, cmd.correlationId);

    return {
        batch,
        event,
    };
}

export function* requestCatalog(ctx: DashboardContext, cmd: InitializeDashboard) {
    const [catalog, dateHierarchyTemplates]: [IWorkspaceCatalog, IDateHierarchyTemplate[]] = yield all([
        call(loadCatalog, ctx, cmd),
        call(loadDateHierarchyTemplates, ctx),
    ]);

    yield put(
        catalogActions.setCatalogItems({
            attributes: catalog.attributes(),
            dateDatasets: catalog.dateDatasets(),
            facts: catalog.facts(),
            measures: catalog.measures(),
            attributeHierarchies: catalog.attributeHierarchies(),
            dateHierarchyTemplates: dateHierarchyTemplates,
        }),
    );
}

export function* preloadAttributeFiltersData(ctx: DashboardContext, dashboard: IDashboard) {
    const attributesWithReferences: PromiseFnReturnType<typeof preloadAttributeFiltersDataFromBackend> =
        yield call(preloadAttributeFiltersDataFromBackend, ctx, dashboard);

    yield put(filterContextActions.setPreloadedAttributesWithReferences(attributesWithReferences));
}

export function* requestDashboardsList(ctx: DashboardContext) {
    const listedDashboards: PromiseFnReturnType<typeof loadDashboardList> = yield call(
        loadDashboardList,
        ctx,
    );
    const dashboardsListActions = batchActions([
        listedDashboardsActions.setListedDashboards(listedDashboards),
        accessibleDashboardsActions.setAccessibleDashboards(listedDashboards),
    ]);

    yield put(dashboardsListActions);
}

function* advancedLoader(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
    dashboard?: IDashboard,
): SagaIterator {
    yield all([
        call(requestCatalog, ctx, cmd),
        call(preloadAttributeFiltersData, ctx, dashboard!),
        call(requestDashboardsList, ctx),
    ]);
}

export function* initializeDashboardHandler(ctx: DashboardContext, cmd: InitializeDashboard): SagaIterator {
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

        yield put(result.event);

        if (dashboardRef) {
            // let's run effects which are not essential for the existing
            // dashboard to be rendered, such as catalog load
            yield spawn(advancedLoader, ctx, cmd, result.event.payload.dashboard);
        }
    } catch (e) {
        yield put(loadingActions.setLoadingError(e as Error));

        throw e;
    }
}
