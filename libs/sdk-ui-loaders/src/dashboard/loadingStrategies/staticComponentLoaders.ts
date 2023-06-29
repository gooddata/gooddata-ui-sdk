// (C) 2021-2022 GoodData Corporation

import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine, newDashboardEngine } from "@gooddata/sdk-ui-dashboard";
import { LoadedPlugin } from "../types.js";

/**
 * This loader expects that a dashboard engine is build-time linked into the application and will create
 * and return new instance of that dashboard engine immediately.
 *
 * @param _dashboard - ignored
 * @internal
 */
export function staticDashboardEngineLoader(
    _dashboard: IDashboardWithReferences | undefined,
): Promise<IDashboardEngine> {
    return Promise.resolve(newDashboardEngine());
}

/**
 * This is a noop plugin loader - it ignores all plugin configuration for the dashboard and will
 * return an empty list of plugins to use.
 *
 * This is useful for plugin development / testing purposes when the dashboard is not yet integrated
 * with any plugin and plugins are provided to the loader using the {@link @gooddata/sdk-ui-loaders#IDashboardLoader.withAdditionalPlugins}
 * method.
 *
 * @param _ctx - ignored
 * @param _dashboard - ignored
 * @internal
 */
export function noopDashboardPluginLoader(
    _ctx: DashboardContext,
    _dashboard: IDashboardWithReferences | undefined,
): Promise<LoadedPlugin[]> {
    return Promise.resolve([]);
}

/**
 * This is a noop before load - it ignores all configuration for the dashboard and will do nothing.
 *
 * This is useful for plugin development / testing purposes when the dashboard is not yet integrated
 * with any plugin and plugins are provided to the loader using the {@link @gooddata/sdk-ui-loaders#IDashboardLoader.withAdditionalPlugins}
 * method.
 *
 * @param _ctx - ignored
 * @param _dashboard - ignored
 * @internal
 */
export function noopDashboardBeforeLoad(
    _ctx: DashboardContext,
    _dashboard: IDashboardWithReferences | undefined,
): Promise<void> {
    return Promise.resolve();
}
