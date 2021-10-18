// (C) 2021 GoodData Corporation
import { IDashboardWithReferences, NotImplemented } from "@gooddata/sdk-backend-spi";
import { DashboardContext, IDashboardEngine, IDashboardPluginContract_V1 } from "@gooddata/sdk-ui-dashboard";

/**
 * @internal
 */
export function dynamicDashboardEngineLoader(
    _dashboard: IDashboardWithReferences,
): Promise<IDashboardEngine> {
    return Promise.reject(new NotImplemented(""));
}

/**
 * @internal
 */
export function dynamicDashboardPluginLoader(
    _ctx: DashboardContext,
    _dashboard: IDashboardWithReferences,
): Promise<IDashboardPluginContract_V1[]> {
    return Promise.reject(new NotImplemented(""));
}
