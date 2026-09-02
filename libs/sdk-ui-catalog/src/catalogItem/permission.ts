// (C) 2025-2026 GoodData Corporation

import {
    type ISettings,
    type IWorkspacePermissions,
    type ObjectType,
    canEditMetric,
    canShareMetric,
} from "@gooddata/sdk-model";

import { isCatalogItemAttribute, isCatalogItemFact, isCatalogItemMeasure } from "./guards.js";
import type { ICatalogItem } from "./types.js";

export function canEditCatalogItem(
    workspacePermissions?: IWorkspacePermissions,
    item?: ICatalogItem | null,
    settings?: ISettings,
) {
    // If the workspace permissions or the item is not provided, the user cannot update it.
    if (!workspacePermissions || !item) {
        return false;
    }

    // If the item is locked, the user cannot update it at all.
    if (item.isLocked) {
        return false;
    }

    // If the user has WS.Manage project permission, they can update the item no matter what
    // type of item it is.
    if (workspacePermissions.canManageProject) {
        return true;
    }

    // If the item is not editable, the user cannot update it.
    if (!item.isEditable) {
        return false;
    }

    // A metric is edited through its own EDIT permission.
    if (isCatalogItemMeasure(item)) {
        return canEditMetric(
            item.permissions,
            workspacePermissions,
            Boolean(settings?.enableMetricPermissions),
        );
    }

    // If the user has WS.Analyze permission to create visualizations, they can update the item if it is a visualization
    // or a dashboard to which they have access.
    if (workspacePermissions.canCreateVisualization) {
        const editableTypes: ObjectType[] = ["analyticalDashboard", "insight"];
        return editableTypes.includes(item.type);
    }

    return false;
}

/**
 * Whether the user may share the item. Metrics are gated by the metric-permissions flag and then by
 * their own SHARE, deliberately not derived from EDIT. Attributes and facts have no object-level
 * permissions, so their column-level-permissions flag decides and the backend refuses the access
 * list to anyone who may not manage them. The two flags are independent.
 */
export function canShareCatalogItem(
    workspacePermissions?: IWorkspacePermissions,
    item?: ICatalogItem | null,
    settings?: ISettings,
) {
    if (!workspacePermissions || !item) {
        return false;
    }

    if (isCatalogItemMeasure(item)) {
        return canShareMetric(
            item.permissions,
            workspacePermissions,
            Boolean(settings?.enableMetricPermissions),
        );
    }

    if (isCatalogItemAttribute(item) || isCatalogItemFact(item)) {
        return Boolean(settings?.enableColumnLevelPermissions);
    }

    return false;
}
