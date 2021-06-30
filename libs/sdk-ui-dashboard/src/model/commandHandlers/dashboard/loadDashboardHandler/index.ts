// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { LoadDashboard } from "../../../commands/dashboard";
import { dispatchDashboardEvent } from "../../../eventEmitter/eventDispatcher";
import { dashboardLoaded } from "../../../events/dashboard";
import { filterContextActions } from "../../../state/filterContext";
import { insightsActions } from "../../../state/insights";
import { layoutActions } from "../../../state/layout";
import { loadingActions } from "../../../state/loading";
import { DashboardContext } from "../../../types/commonTypes";
import { IDashboardLayout, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
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
import { batchActions } from "redux-batched-actions";
import { internalErrorOccurred } from "../../../events/general";
import { loadUser } from "./loadUser";
import { userActions } from "../../../state/user";
import { metaActions } from "../../../state/meta";
import { dashboardFilterContextDefinition } from "../../../_staging/dashboard/dashboardFilterContext";
import { dashboardLayoutSanitize } from "../../../_staging/dashboard/dashboardLayout";
import { loadDashboardList } from "./loadDashboardList";
import { listedDashboardsActions } from "../../../state/listedDashboards";

function loadDashboardFromBackend(ctx: DashboardContext): Promise<IDashboardWithReferences> {
    const { backend, workspace, dashboardRef } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardWithReferences(dashboardRef!);
}

const EmptyDashboardLayout: IDashboardLayout = {
    type: "IDashboardLayout",
    sections: [],
};

export function* loadDashboardHandler(ctx: DashboardContext, cmd: LoadDashboard): SagaIterator<void> {
    try {
        yield put(loadingActions.setLoadingStart());

        const [dashboardWithReferences, config, permissions, catalog, alerts, user, listedDashboards]: [
            PromiseFnReturnType<typeof loadDashboardFromBackend>,
            SagaReturnType<typeof resolveDashboardConfig>,
            SagaReturnType<typeof resolvePermissions>,
            PromiseFnReturnType<typeof loadCatalog>,
            PromiseFnReturnType<typeof loadDashboardAlerts>,
            PromiseFnReturnType<typeof loadUser>,
            PromiseFnReturnType<typeof loadDashboardList>,
        ] = yield all([
            call(loadDashboardFromBackend, ctx),
            call(resolveDashboardConfig, ctx, cmd),
            call(resolvePermissions, ctx, cmd),
            call(loadCatalog, ctx),
            call(loadDashboardAlerts, ctx),
            call(loadUser, ctx),
            call(loadDashboardList, ctx),
        ]);

        const { dashboard, references } = dashboardWithReferences;
        const effectiveDateFilterConfig: DateFilterMergeResult = yield call(
            mergeDateFilterConfigWithOverrides,
            ctx,
            cmd,
            config.dateFilterConfig!,
            dashboard.dateFilterConfig,
        );

        const filterContextDefinition = dashboardFilterContextDefinition(
            dashboard,
            effectiveDateFilterConfig.config,
        );

        const dashboardLayout = dashboardLayoutSanitize(
            dashboard.layout ?? EmptyDashboardLayout,
            references.insights,
            config.settings,
        );

        const batch = batchActions(
            [
                configActions.setConfig(config),
                userActions.setUser(user),
                permissionsActions.setPermissions(permissions),
                catalogActions.setCatalogItems({
                    attributes: catalog.attributes(),
                    dateDatasets: catalog.dateDatasets(),
                    facts: catalog.facts(),
                    measures: catalog.measures(),
                }),
                alertsActions.setAlerts(alerts),
                filterContextActions.setFilterContext(filterContextDefinition),
                // TODO: move code that catches errors in layout
                // TODO: move code that validates and fixes widget sizes
                layoutActions.setLayout(dashboardLayout),
                dateFilterConfigActions.setDateFilterConfig({
                    dateFilterConfig: dashboard.dateFilterConfig,
                    effectiveDateFilterConfig: effectiveDateFilterConfig.config,
                    isUsingDashboardOverrides: effectiveDateFilterConfig.source === "dashboard",
                }),
                insightsActions.setInsights(references.insights),
                metaActions.setMeta({
                    ref: dashboard.ref,
                    uri: dashboard.uri,
                    identifier: dashboard.identifier,
                    title: dashboard.title,
                    updated: dashboard.updated,
                    description: dashboard.description,
                    created: dashboard.created,
                    isLocked: dashboard.isLocked,
                }),
                listedDashboardsActions.setListedDashboards(listedDashboards),
            ],
            "@@GDC.DASH/BATCH.LOAD",
        );

        yield put(batch);
        yield put(loadingActions.setLoadingSuccess());

        yield dispatchDashboardEvent(
            dashboardLoaded(ctx, dashboard, references.insights, config, permissions, cmd.correlationId),
        );
    } catch (e) {
        yield put(loadingActions.setLoadingError(e.message));
        yield dispatchDashboardEvent(
            internalErrorOccurred(
                ctx,
                "An unexpected error has occurred while loading dashboard",
                e,
                cmd.correlationId,
            ),
        );
    }
}
