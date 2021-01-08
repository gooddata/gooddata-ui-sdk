// (C) 2021 GoodData Corporation
import LRUCache from "lru-cache";
import { IAnalyticalBackend, IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import { DASHBOARD_CACHE_SIZE } from "./constants";
import { dataLoaderAbstractFactory } from "../../../../dataLoaders/DataLoaderAbstractFactory";

/**
 * @internal
 */
export interface IDashboardAlertsDataLoader {
    /**
     * Obtains all alerts for the current user for the given analyticalDashboard specified by a ref.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     * @param ref - the ref of the analyticalDashboard to obtain
     */
    getDashboardAlerts(backend: IAnalyticalBackend, ref: ObjRef): Promise<IWidgetAlert[]>;
}

class DashboardAlertsDataLoader implements IDashboardAlertsDataLoader {
    private dashboardAlertsCache: LRUCache<string, Promise<IWidgetAlert[]>> = new LRUCache({
        max: DASHBOARD_CACHE_SIZE,
    });

    constructor(protected readonly workspace: string) {}

    public getDashboardAlerts(backend: IAnalyticalBackend, ref: ObjRef): Promise<IWidgetAlert[]> {
        const cacheKey = objRefToString(ref);
        let dashboardAlerts = this.dashboardAlertsCache.get(cacheKey);

        if (!dashboardAlerts) {
            dashboardAlerts = backend
                .workspace(this.workspace)
                .dashboards()
                .getDashboardWidgetAlertsForCurrentUser(ref)
                .catch((error) => {
                    this.dashboardAlertsCache.del(cacheKey);
                    throw error;
                });

            this.dashboardAlertsCache.set(cacheKey, dashboardAlerts);
        }

        return dashboardAlerts;
    }
}

/**
 * @internal
 */
export const dashboardAlertsDataLoaderFactory = dataLoaderAbstractFactory<IDashboardAlertsDataLoader>(
    (workspace) => new DashboardAlertsDataLoader(workspace),
);
