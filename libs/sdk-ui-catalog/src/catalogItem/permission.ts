// (C) 2025 GoodData Corporation

import type { IWorkspacePermissions, ObjectType } from "@gooddata/sdk-model";

import type { ICatalogItem } from "./types.js";

export function canEditCatalogItem(workspacePermissions?: IWorkspacePermissions, item?: ICatalogItem | null) {
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

    // If the user has WS.Analyze permission to create visualizations, they can update the item if it is a visualization
    // or a dashboard to which they have access.
    if (workspacePermissions.canCreateVisualization) {
        const editableTypes: ObjectType[] = ["analyticalDashboard", "insight"];
        return editableTypes.includes(item.type);
    }

    return false;
}
