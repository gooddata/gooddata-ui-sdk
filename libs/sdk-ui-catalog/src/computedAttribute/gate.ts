// (C) 2026 GoodData Corporation

import { useWorkspacePermission } from "../permission/PermissionsContext.js";

/** The flag gating catalog computed attributes, referenced by
 *  `computedAttributeDescriptor.featureFlag` and `useCatalogEndpoints` `gatedBy`. */
export const COMPUTED_ATTRIBUTE_FEATURE_FLAG = "enableComputedAttributes";

/** Whether the user may create computed attributes in this workspace. False until the permissions load. */
export function useCanCreateComputedAttribute(): boolean {
    return useWorkspacePermission("canCreateComputedAttribute");
}
