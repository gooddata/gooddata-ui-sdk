// (C) 2019-2021 GoodData Corporation

/**
 * This package provides various component loaders.
 *
 * @remarks
 * Currently, there are loaders related to Dashboard embedding and Dashboard plugins.
 * See also `@gooddata/sdk-ui-dashboard`.
 *
 * @packageDocumentation
 */

export { IDashboardLoader, DashboardLoadResult, IEmbeddedPlugin } from "./dashboard/loader";
export { DashboardLoader } from "./dashboard/dashboardLoader";
export { DashboardStub, IDashboardStubProps } from "./dashboard/DashboardStub";
export {
    IDashboardLoadOptions,
    IDashboardBasePropsForLoader,
    ModuleFederationIntegration,
    AdaptiveLoadOptions,
} from "./dashboard/types";
export { useDashboardLoader, DashboardLoadStatus } from "./dashboard/useDashboardLoader";
