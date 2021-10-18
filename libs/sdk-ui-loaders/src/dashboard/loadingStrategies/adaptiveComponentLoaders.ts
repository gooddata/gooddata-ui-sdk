// (C) 2021 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine, IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";
import isEmpty from "lodash/isEmpty";
import { noopDashboardPluginLoader, staticDashboardEngineLoader } from "./staticComponentLoaders";
import { dynamicDashboardEngineLoader, dynamicDashboardPluginLoader } from "./dynamicComponentLoaders";

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use the
 * dynamic loading to get the engine. Otherwise will use the static loading.
 *
 * @param dashboard - loaded dashboard
 * @internal
 */
export function adaptiveDashboardEngineLoader(
    dashboard: IDashboardWithReferences,
): Promise<IDashboardEngine> {
    if (!isEmpty(dashboard.references.plugins)) {
        return dynamicDashboardEngineLoader(dashboard);
    }

    return staticDashboardEngineLoader(dashboard);
}

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use
 * the dynamic loading to get the plugins. Otherwise will not load any plugins..
 *
 * @param ctx - context in which the dashboard operates
 * @param dashboard - loaded dashboard
 * @internal
 */
export function adaptiveDashboardPluginLoader(
    ctx: DashboardContext,
    dashboard: IDashboardWithReferences,
): Promise<IDashboardPluginContract_V1[]> {
    if (!isEmpty(dashboard.references.plugins)) {
        return dynamicDashboardPluginLoader(ctx, dashboard);
    }

    return noopDashboardPluginLoader(ctx, dashboard);
}
