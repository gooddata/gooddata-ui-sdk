// (C) 2026 GoodData Corporation

import { useFeatureFlag, useWorkspacePermission } from "../permission/PermissionsContext.js";

/**
 * Catalog inline metric editor feature gate.
 */
export function useIsCatalogMetricEditorEnabled(): boolean {
    return useFeatureFlag("enableAnalyticalCatalogMetricEditor");
}

/**
 * Whether the current user can create and edit metrics inline in the catalog.
 */
export function useCanManageMetric(): boolean {
    const isMetricEditorEnabled = useIsCatalogMetricEditorEnabled();
    const canManageProject = useWorkspacePermission("canManageProject");
    return isMetricEditorEnabled && canManageProject;
}
