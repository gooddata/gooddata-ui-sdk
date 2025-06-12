// (C) 2019-2024 GoodData Corporation

/**
 * This package provides various component loaders.
 *
 * @remarks
 * Currently, there are loaders related to Dashboard embedding and Dashboard plugins.
 * See also `@gooddata/sdk-ui-dashboard`.
 *
 * @packageDocumentation
 */

export type { IDashboardLoader, DashboardLoadResult } from "./dashboard/loader.js";
export { DashboardLoader } from "./dashboard/dashboardLoader.js";
export type { IDashboardStubProps } from "./dashboard/DashboardStub.js";
export { DashboardStub } from "./dashboard/DashboardStub.js";
export type {
    IDashboardLoadOptions,
    IDashboardBasePropsForLoader,
    ModuleFederationIntegration,
    AdaptiveLoadOptions,
    IEmbeddedPlugin,
    DashboardLoadingMode,
} from "./dashboard/types.js";
export type { DashboardLoadStatus } from "./dashboard/useDashboardLoader.js";
export { useDashboardLoader } from "./dashboard/useDashboardLoader.js";
export { useDashboardLoaderWithPluginManipulation } from "./dashboard/useDashboardLoaderWithPluginManipulation.js";
