// (C) 2026 GoodData Corporation

import { type EntitiesApiGetEntityAnalyticalDashboardsRequest } from "@gooddata/api-client-tiger";
import { type SupportedDashboardReferenceTypes } from "@gooddata/sdk-backend-spi";

type DashboardInclude = NonNullable<EntitiesApiGetEntityAnalyticalDashboardsRequest["include"]>[number];

const SIDELOADED_REFERENCE_TYPES = [
    "insight",
    "dataSet",
    "dashboardPlugin",
    "analyticalDashboard",
    "measure",
    "computedAttribute",
    "displayForm",
] as const satisfies readonly SupportedDashboardReferenceTypes[];

const SIDELOAD_INCLUDE_BY_TYPE = {
    insight: "visualizationObjects",
    dataSet: "datasets",
    dashboardPlugin: "dashboardPlugins",
    analyticalDashboard: "analyticalDashboards",
    measure: "metrics",
    computedAttribute: "computedAttributes",
    displayForm: "labels",
} as const satisfies Partial<Record<SupportedDashboardReferenceTypes, DashboardInclude>>;

/**
 * Side-loads for a dashboard GET. Filter contexts are always side-loaded because dashboard
 * conversion needs them. Dashboard dependencies include labels; filter-context labels are also
 * fetched separately from their owning contexts.
 */
export function dashboardSideloadIncludes(types: SupportedDashboardReferenceTypes[]): DashboardInclude[] {
    return [
        "filterContexts",
        ...SIDELOADED_REFERENCE_TYPES.filter((type) => types.includes(type)).map(
            (type) => SIDELOAD_INCLUDE_BY_TYPE[type],
        ),
    ];
}
