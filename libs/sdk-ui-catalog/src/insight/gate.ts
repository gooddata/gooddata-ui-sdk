// (C) 2026 GoodData Corporation

import { useWorkspacePermission } from "../permission/PermissionsContext.js";

/** The flag gating the in-catalog visualization editor, referenced by
 *  `visualizationDescriptor.featureFlag`. */
export const VISUALIZATION_EDITOR_FEATURE_FLAG = "enableAnalyticalCatalogVisualizationEditor";

/** Whether the user may create visualizations in this workspace. False until the permissions load. */
export function useCanCreateVisualization(): boolean {
    return useWorkspacePermission("canCreateVisualization");
}
