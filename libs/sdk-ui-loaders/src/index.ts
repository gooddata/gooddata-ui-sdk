// (C) 2019-2022 GoodData Corporation

/**
 * This package provides various component loaders.
 *
 * @remarks
 * Currently, there are loaders related to Dashboard embedding and Dashboard plugins.
 * See also `@gooddata/sdk-ui-dashboard`.
 *
 * @packageDocumentation
 */

export { IDashboardLoader, DashboardLoadResult } from "./dashboard/loader.js";
export { DashboardLoader } from "./dashboard/dashboardLoader.js";
export { DashboardStub, IDashboardStubProps } from "./dashboard/DashboardStub.js";
export {
    IDashboardLoadOptions,
    IDashboardBasePropsForLoader,
    ModuleFederationIntegration,
    AdaptiveLoadOptions,
    IEmbeddedPlugin,
    DashboardLoadingMode,
} from "./dashboard/types.js";
export { useDashboardLoader, DashboardLoadStatus } from "./dashboard/useDashboardLoader.js";
export { useDashboardLoaderWithPluginManipulation } from "./dashboard/useDashboardLoaderWithPluginManipulation.js";
