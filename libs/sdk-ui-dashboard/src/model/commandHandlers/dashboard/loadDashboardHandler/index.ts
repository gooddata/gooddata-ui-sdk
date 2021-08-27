// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { all, call, put, SagaReturnType } from "redux-saga/effects";
import { LoadDashboard } from "../../../commands/dashboard";
import { DashboardLoaded, dashboardLoaded } from "../../../events/dashboard";
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
import { BatchAction, batchActions } from "redux-batched-actions";
import { loadUser } from "./loadUser";
import { userActions } from "../../../state/user";
import { metaActions } from "../../../state/meta";
import {
    dashboardFilterContextDefinition,
    dashboardFilterContextIdentity,
} from "../../../../_staging/dashboard/dashboardFilterContext";
import { dashboardLayoutSanitize } from "../../../../_staging/dashboard/dashboardLayout";
import { loadDashboardList } from "./loadDashboardList";
import { listedDashboardsActions } from "../../../state/listedDashboards";
import { backendCapabilitiesActions } from "../../../state/backendCapabilities";
import { ObjRef } from "@gooddata/sdk-model";
import { invalidArgumentsProvided } from "../../../events/general";

function loadDashboardFromBackend(
    ctx: DashboardContext,
    dashboardRef: ObjRef,
): Promise<IDashboardWithReferences> {
    const { backend, workspace } = ctx;

    return backend.workspace(workspace).dashboards().getDashboardWithReferences(dashboardRef);
}

const EmptyDashboardLayout: IDashboardLayout = {
    type: "IDashboardLayout",
    sections: [],
};

type DashboardLoadResult = {
    batch: BatchAction;
    event: DashboardLoaded;
};

function* loadExistingDashboard(
    ctx: DashboardContext,
    cmd: LoadDashboard,
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
    const filterContextIdentity = dashboardFilterContextIdentity(dashboard);

    const dashboardLayout = dashboardLayoutSanitize(
        dashboard.layout ?? EmptyDashboardLayout,
        references.insights,
        config.settings,
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
            alertsActions.setAlerts(alerts),
            filterContextActions.setFilterContext({
                filterContextDefinition,
                filterContextIdentity,
            }),
            layoutActions.setLayout(dashboardLayout),
            dateFilterConfigActions.setDateFilterConfig({
                dateFilterConfig: dashboard.dateFilterConfig,
                effectiveDateFilterConfig: effectiveDateFilterConfig.config,
                isUsingDashboardOverrides: effectiveDateFilterConfig.source === "dashboard",
            }),
            insightsActions.setInsights(references.insights),
            metaActions.setMeta({
                dashboard,
            }),
            listedDashboardsActions.setListedDashboards(listedDashboards),
        ],
        "@@GDC.DASH/BATCH.LOAD",
    );
    const event = dashboardLoaded(
        ctx,
        dashboard,
        references.insights,
        config,
        permissions,
        cmd.correlationId,
    );

    return {
        batch,
        event,
    };
}

export function* loadDashboardHandler(
    ctx: DashboardContext,
    cmd: LoadDashboard,
): SagaIterator<DashboardLoaded> {
    const { dashboardRef } = ctx;
    try {
        yield put(loadingActions.setLoadingStart());

        let result: DashboardLoadResult;

        if (dashboardRef) {
            result = yield call(loadExistingDashboard, ctx, cmd, dashboardRef);
        } else {
            throw invalidArgumentsProvided(ctx, cmd, "Creating new dashboard is not yet supported.");
        }

        yield put(result.batch);
        yield put(loadingActions.setLoadingSuccess());

        return result.event;
    } catch (e) {
        yield put(loadingActions.setLoadingError(e.message));

        throw e;
    }
}
