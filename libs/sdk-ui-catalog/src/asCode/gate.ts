// (C) 2026 GoodData Corporation

import { useFeatureFlag, useWorkspacePermission } from "../permission/PermissionsContext.js";

/**
 * Whether the current user can manage a catalog as-code object of a type gated by `featureFlag`:
 * the feature flag is on and the user can manage the workspace.
 */
export function useCanManageAsCode(featureFlag: Parameters<typeof useFeatureFlag>[0]): boolean {
    const isEnabled = useFeatureFlag(featureFlag);
    const canManageProject = useWorkspacePermission("canManageProject");
    return isEnabled && canManageProject;
}
