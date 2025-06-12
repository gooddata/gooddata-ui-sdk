// (C) 2021-2022 GoodData Corporation
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine } from "@gooddata/sdk-ui-dashboard";
import isEmpty from "lodash/isEmpty.js";
import {
    noopDashboardBeforeLoad,
    noopDashboardPluginLoader,
    staticDashboardEngineLoader,
} from "./staticComponentLoaders.js";
import {
    dynamicDashboardBeforeLoad,
    dynamicDashboardEngineLoader,
    dynamicDashboardPluginLoader,
} from "./dynamicComponentLoaders.js";
import { IDashboardPluginsLoaderOptions, LoadedPlugin, ModuleFederationIntegration } from "../types.js";

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use the
 * dynamic loading to get the engine. Otherwise will use the static loading.
 *
 * @param moduleFederationIntegration - configuration related to the Module Federation
 * @param dashboard - loaded dashboard
 * @internal
 */
export const adaptiveDashboardEngineLoaderFactory =
    (moduleFederationIntegration: ModuleFederationIntegration) =>
    (dashboard: IDashboardWithReferences | undefined): Promise<IDashboardEngine> => {
        if (dashboard && !isEmpty(dashboard.references.plugins)) {
            return dynamicDashboardEngineLoader(dashboard, moduleFederationIntegration);
        }

        return staticDashboardEngineLoader(dashboard);
    };

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use
 * the dynamic loading to get the plugins. Otherwise will not load any plugins.
 *
 * @param moduleFederationIntegration - configuration related to the Module Federation
 * @param ctx - context in which the dashboard operates
 * @param dashboard - loaded dashboard
 * @internal
 */
export const adaptiveDashboardPluginLoaderFactory =
    (moduleFederationIntegration: ModuleFederationIntegration) =>
    (
        ctx: DashboardContext,
        dashboard: IDashboardWithReferences | undefined,
        options?: IDashboardPluginsLoaderOptions,
    ): Promise<LoadedPlugin[]> => {
        if (dashboard && !isEmpty(dashboard.references.plugins)) {
            options?.beforePluginsLoaded({ externalPluginsCount: dashboard.references.plugins.length });
            return dynamicDashboardPluginLoader(ctx, dashboard, moduleFederationIntegration);
        }

        return noopDashboardPluginLoader(ctx, dashboard);
    };

/**
 * Adaptive loader will check if there are any plugins linked with the dashboard. If so, it will use
 * the dynamic loading to get the common data. Otherwise will not do anything.
 *
 * @param _moduleFederationIntegration - configuration related to the Module Federation
 * @param ctx - context in which the dashboard operates
 * @param dashboard - loaded dashboard
 * @internal
 */
export const adaptiveDashboardBeforeLoadFactory =
    (_moduleFederationIntegration: ModuleFederationIntegration) =>
    (ctx: DashboardContext, dashboard: IDashboardWithReferences | undefined): Promise<void> => {
        if (dashboard && !isEmpty(dashboard.references.plugins)) {
            return dynamicDashboardBeforeLoad(ctx, dashboard);
        }

        return noopDashboardBeforeLoad(ctx, dashboard);
    };
