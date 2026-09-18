// (C) 2025-2026 GoodData Corporation

import {
    type ISettings,
    type IWorkspacePermissions,
    canEditMetric,
    canEditVisualization,
    canShareMetric,
    canShareVisualization,
} from "@gooddata/sdk-model";

import { COMPUTED_ATTRIBUTE_FEATURE_FLAG } from "../computedAttribute/gate.js";

import {
    isCatalogItemAttribute,
    isCatalogItemComputedAttribute,
    isCatalogItemDashboard,
    isCatalogItemFact,
    isCatalogItemInsight,
    isCatalogItemMeasure,
} from "./guards.js";
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

    // A visualization is edited through its own EDIT permission.
    if (isCatalogItemInsight(item)) {
        return canEditVisualization(
            item.permissions,
            workspacePermissions,
            Boolean(settings?.enableVisualizationPermissions),
        );
    }

    // With WS.Analyze the user can update a dashboard to which they have access.
    return isCatalogItemDashboard(item) && workspacePermissions.canCreateVisualization;
}

/**
 * Whether the user may share the item. Metrics and visualizations are gated by their own permissions
 * flag and then by their own SHARE, deliberately not derived from EDIT. Attributes and facts have no object-level
 * permissions, so their column-level-permissions flag decides and the backend refuses the access
 * list to anyone who may not manage them. The two flags are independent. A computed
 * attribute follows the attribute rule and additionally needs the computed-attributes
 * flag, which gates the whole entity in the catalog.
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

    if (isCatalogItemInsight(item)) {
        return canShareVisualization(
            item.permissions,
            workspacePermissions,
            Boolean(settings?.enableVisualizationPermissions),
        );
    }

    if (isCatalogItemAttribute(item) || isCatalogItemFact(item)) {
        return Boolean(settings?.enableColumnLevelPermissions);
    }

    if (isCatalogItemComputedAttribute(item)) {
        return (
            Boolean(settings?.enableColumnLevelPermissions) &&
            Boolean(settings?.[COMPUTED_ATTRIBUTE_FEATURE_FLAG])
        );
    }

    return false;
}
