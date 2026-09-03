// (C) 2026 GoodData Corporation

import { canCreateMetric } from "@gooddata/sdk-model";

import { usePermissionsState } from "../permission/PermissionsContext.js";

/** The flag gating the in-catalog metric editor, referenced by `metricDescriptor.featureFlag`. */
export const METRIC_EDITOR_FEATURE_FLAG = "enableAnalyticalCatalogMetricEditor";

/** Whether the user may create metrics in this workspace. False until the permissions load. */
export function useCanCreateMetric(): boolean {
    const { result } = usePermissionsState();

    return result
        ? canCreateMetric(result.permissions, Boolean(result.settings.enableMetricPermissions))
        : false;
}
