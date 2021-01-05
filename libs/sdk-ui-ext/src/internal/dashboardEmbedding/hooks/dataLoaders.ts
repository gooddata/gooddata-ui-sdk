// (C) 2021 GoodData Corporation
import LRUCache from "lru-cache";
import flatMap from "lodash/flatMap";
import {
    IAnalyticalBackend,
    ICatalogAttribute,
    ICatalogDateAttribute,
    IDashboard,
    IUserWorkspaceSettings,
    IWidgetAlert,
    IWorkspacePermissions,
} from "@gooddata/sdk-backend-spi";
import { IColorPalette, IInsight, ObjRef, objRefToString } from "@gooddata/sdk-model";
import { IInsightViewDataLoader, getInsightViewDataLoader } from "../../../insightView/dataLoaders";

/**
 * Loaders for how many different workspaces will be kept.
 */
const LOADER_CACHE_SIZE = 5;

/**
 * How many dashboards will be kept for each workspace.
 */
const DASHBOARD_CACHE_SIZE = 20;

/**
 * This class provides access to data needed to render a DashboardView.
 *
 * @internal
 */
export interface IDashboardViewDataLoader extends IInsightViewDataLoader {
    /**
     * Obtains an analyticalDashboard specified by a ref.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     * @param ref - the ref of the analyticalDashboard to obtain
     */
    getDashboard(backend: IAnalyticalBackend, ref: ObjRef): Promise<IDashboard>;
    /**
     * Obtains all alerts for the current user for the given analyticalDashboard specified by a ref.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     * @param ref - the ref of the analyticalDashboard to obtain
     */
    getDashboardAlerts(backend: IAnalyticalBackend, ref: ObjRef): Promise<IWidgetAlert[]>;
    /**
     * Obtains all catalog attributes with a drill down specified.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getAttributesWithDrillDown(
        backend: IAnalyticalBackend,
    ): Promise<Array<ICatalogAttribute | ICatalogDateAttribute>>;
    /**
     * Obtains the user workspace permissions for the current user workspace.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getUserWorkspacePermissions(backend: IAnalyticalBackend): Promise<IWorkspacePermissions>;
}

/**
 * This implementation of {@link IDashboardViewDataLoader} provides caching capabilities for the data loading.
 *
 * @internal
 */
export class DashboardViewDataLoader implements IDashboardViewDataLoader {
    private cachedAttributesWithDrillDown:
        | Promise<Array<ICatalogAttribute | ICatalogDateAttribute>>
        | undefined;
    private cachedUserWorkspacePermissions: Promise<IWorkspacePermissions> | undefined;
    private dashboardCache: LRUCache<string, Promise<IDashboard>> = new LRUCache({
        max: DASHBOARD_CACHE_SIZE,
    });
    private dashboardAlertsCache: LRUCache<string, Promise<IWidgetAlert[]>> = new LRUCache({
        max: DASHBOARD_CACHE_SIZE,
    });

    constructor(protected readonly workspace: string) {}

    public getInsight(backend: IAnalyticalBackend, ref: ObjRef): Promise<IInsight> {
        return getInsightViewDataLoader(this.workspace).getInsight(backend, ref);
    }

    public getColorPalette(backend: IAnalyticalBackend): Promise<IColorPalette> {
        return getInsightViewDataLoader(this.workspace).getColorPalette(backend);
    }

    public getUserWorkspaceSettings(backend: IAnalyticalBackend): Promise<IUserWorkspaceSettings> {
        return getInsightViewDataLoader(this.workspace).getUserWorkspaceSettings(backend);
    }

    public getDashboard(backend: IAnalyticalBackend, ref: ObjRef): Promise<IDashboard> {
        const cacheKey = objRefToString(ref);
        let dashboard = this.dashboardCache.get(cacheKey);

        if (!dashboard) {
            dashboard = backend
                .workspace(this.workspace)
                .dashboards()
                .getDashboard(ref)
                .catch((error) => {
                    this.dashboardCache.del(cacheKey);
                    throw error;
                });

            this.dashboardCache.set(cacheKey, dashboard);
        }

        return dashboard;
    }

    public getDashboardAlerts(backend: IAnalyticalBackend, ref: ObjRef): Promise<IWidgetAlert[]> {
        const cacheKey = objRefToString(ref);
        let dashboardAlerts = this.dashboardAlertsCache.get(cacheKey);

        if (!dashboardAlerts) {
            dashboardAlerts = backend
                .workspace(this.workspace)
                .dashboards()
                .getDashboardWidgetAlertsForCurrentUser(ref)
                .catch((error) => {
                    this.dashboardCache.del(cacheKey);
                    throw error;
                });

            this.dashboardAlertsCache.set(cacheKey, dashboardAlerts);
        }

        return dashboardAlerts;
    }

    public getAttributesWithDrillDown(
        backend: IAnalyticalBackend,
    ): Promise<Array<ICatalogAttribute | ICatalogDateAttribute>> {
        if (!this.cachedAttributesWithDrillDown) {
            this.cachedAttributesWithDrillDown = backend
                .workspace(this.workspace)
                .catalog()
                .forTypes(["attribute", "dateDataset"])
                .load()
                .then((catalog) => {
                    const attributes = catalog.attributes();
                    const dateAttributes = flatMap(catalog.dateDatasets(), (dd) => dd.dateAttributes);
                    return [...attributes, ...dateAttributes].filter((attr) => attr.attribute.drillDownStep);
                })
                .catch((error) => {
                    this.cachedAttributesWithDrillDown = undefined;
                    throw error;
                });
        }

        return this.cachedAttributesWithDrillDown;
    }

    public getUserWorkspacePermissions(backend: IAnalyticalBackend): Promise<IWorkspacePermissions> {
        if (!this.cachedUserWorkspacePermissions) {
            this.cachedUserWorkspacePermissions = backend
                .workspace(this.workspace)
                .permissions()
                .getPermissionsForCurrentUser()
                .catch((error) => {
                    this.cachedUserWorkspacePermissions = undefined;
                    throw error;
                });
        }

        return this.cachedUserWorkspacePermissions;
    }
}

const loaders: LRUCache<string, IDashboardViewDataLoader> = new LRUCache({ max: LOADER_CACHE_SIZE });

/**
 * Clears all the DashboardView caches for all workspaces.
 *
 * @internal
 */
export const clearDashboardViewCaches = (): void => {
    loaders.reset();
};

/**
 * Gets an {@link IDashboardViewDataLoader} instance for a given workspace.
 * @param workspace - the workspace to get the data from
 * @internal
 */
export const getDashboardViewDataLoader = (workspace: string): IDashboardViewDataLoader => {
    let loader = loaders.get(workspace);

    if (!loader) {
        loader = new DashboardViewDataLoader(workspace);
        loaders.set(workspace, loader);
    }

    return loader;
};
