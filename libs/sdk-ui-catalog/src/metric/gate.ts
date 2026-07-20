// (C) 2026 GoodData Corporation

import { useCanManageAsCode } from "../asCode/gate.js";

/** The flag gating the in-catalog metric editor. The single source of truth, referenced by both the
 *  gate below and `metricDescriptor.featureFlag`. */
export const METRIC_EDITOR_FEATURE_FLAG = "enableAnalyticalCatalogMetricEditor";

/**
 * Whether the current user can create and edit metrics inline in the catalog.
 */
export function useCanManageMetric(): boolean {
    return useCanManageAsCode(METRIC_EDITOR_FEATURE_FLAG);
}
