// (C) 2021 GoodData Corporation
import { LRUCache } from "@gooddata/util";
import { IAnalyticalBackend, IDashboard } from "@gooddata/sdk-backend-spi";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";

import { DASHBOARD_CACHE_SIZE } from "./constants";
import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory";

interface IDashboardDataLoader {
    /**
     * Obtains an analyticalDashboard specified by a ref.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     * @param ref - the ref of the analyticalDashboard to obtain
     */
    getDashboard(backend: IAnalyticalBackend, ref: ObjRef): Promise<IDashboard>;
}

class DashboardDataLoader implements IDashboardDataLoader {
    private dashboardCache = new LRUCache<Promise<IDashboard>>({ maxSize: DASHBOARD_CACHE_SIZE });

    constructor(protected readonly workspace: string) {}

    public getDashboard(backend: IAnalyticalBackend, ref: ObjRef): Promise<IDashboard> {
        const cacheKey = objRefToString(ref);
        let dashboard = this.dashboardCache.get(cacheKey);

        if (!dashboard) {
            dashboard = backend
                .workspace(this.workspace)
                .dashboards()
                .getDashboard(ref)
                .catch((error) => {
                    this.dashboardCache.delete(cacheKey);
                    throw error;
                });

            this.dashboardCache.set(cacheKey, dashboard);
        }

        return dashboard;
    }
}

/**
 * @internal
 */
export const dashboardDataLoaderFactory = dataLoaderAbstractFactory<IDashboardDataLoader>(
    (workspace) => new DashboardDataLoader(workspace),
);
