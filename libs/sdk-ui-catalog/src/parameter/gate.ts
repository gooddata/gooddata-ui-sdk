// (C) 2026 GoodData Corporation

import { useFeatureFlag, useWorkspacePermission } from "../permission/PermissionsContext.js";

/**
 * Catalog parameter feature gate.
 */
export function useIsParametersEnabled(): boolean {
    return useFeatureFlag("enableParameters");
}

/**
 * Whether the current user can manage parameters in the catalog.
 */
export function useCanManageParameter(): boolean {
    const isParametersEnabled = useIsParametersEnabled();
    const canManageProject = useWorkspacePermission("canManageProject");
    return isParametersEnabled && canManageProject;
}
