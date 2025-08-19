// (C) 2024-2025 GoodData Corporation

import isEqual from "lodash/isEqual.js";
import { IntlShape } from "react-intl";

import { workspaceGranularPermissionMessages } from "./locales.js";
import { IGrantedWorkspace, WorkspacePermission, WorkspacePermissions } from "../../types.js";

export const workspacePermissions: WorkspacePermissions = ["MANAGE", "ANALYZE", "VIEW"];
const exportSubPermissions: WorkspacePermissions = ["EXPORT_PDF", "EXPORT_TABULAR"];
export const exportPermissions: WorkspacePermissions = ["EXPORT", ...exportSubPermissions];

/**
 * Main workspace permissions imply some of the granular permissions that
 * we want to explicitly show on UI but not necessarily store on backend.
 *
 * Returns the list of these granular permissions.
 */
export const getImplicitGranularPermissions = (
    workspacePermission: WorkspacePermission,
): WorkspacePermissions => {
    switch (workspacePermission) {
        case "VIEW":
            return [];
        case "ANALYZE":
            return ["CREATE_FILTER_VIEW"];
        case "MANAGE":
            return ["EXPORT", "EXPORT_PDF", "EXPORT_TABULAR", "CREATE_AUTOMATION", "CREATE_FILTER_VIEW"];
        default:
            return [];
    }
};

/**
 * Returns hierarchically strongest permission from the list.
 */
export const getWorkspacePermission = (permissions: WorkspacePermissions): WorkspacePermission => {
    if (permissions.includes("MANAGE")) {
        return "MANAGE";
    } else if (permissions.includes("ANALYZE")) {
        return "ANALYZE";
    } else {
        return "VIEW";
    }
};

/**
 * Returns all granular permissions from a list, inluding implicit ones.
 */
export const getGranularPermissions = (permissions: WorkspacePermissions): WorkspacePermissions => {
    const workspacePermission = getWorkspacePermission(permissions);
    const implicitGranularPermissions = getImplicitGranularPermissions(workspacePermission);
    const onlyGranularPermissions = permissions.filter((p) => !workspacePermissions.includes(p));
    const exportSubPermissions = onlyGranularPermissions.includes("EXPORT")
        ? (["EXPORT_PDF", "EXPORT_TABULAR"] as WorkspacePermissions)
        : [];

    return [
        ...new Set([...implicitGranularPermissions, ...onlyGranularPermissions, ...exportSubPermissions]),
    ];
};

/**
 * Export permission is a granular permission that has subpermissions,
 * so sanitization on UI is needed when selecting and deselecting occurs.
 *
 * Returns the list of permissions with export permissions sanitized.
 */
export const sanitizeExportPermissions = (
    changedPermission: WorkspacePermission,
    permissions: WorkspacePermissions,
    include: boolean,
): WorkspacePermissions => {
    const isExportSubPermission = exportSubPermissions.includes(changedPermission);
    const hasExportPdf = permissions.includes("EXPORT_PDF");
    const hasExportTabular = permissions.includes("EXPORT_TABULAR");

    if (!include && isExportSubPermission) {
        // Remove EXPORT permission if a granular export subpermission is removed
        return permissions.filter((p) => p !== "EXPORT");
    }

    if (include && isExportSubPermission && hasExportPdf && hasExportTabular) {
        // Add EXPORT permission if both granular export subpermissions are included
        return [...new Set([...permissions, "EXPORT" as WorkspacePermission])];
    }

    // Return permissions unchanged if the changed permission is not EXPORT
    if (changedPermission !== "EXPORT") {
        return permissions;
    }

    // Include all export permissions
    if (include) {
        return [...new Set([...permissions, ...exportPermissions])];
    }

    // Remove all export permissions
    return permissions.filter((p) => !exportPermissions.includes(p));
};

/**
 * When export permission is not selected, but one of its child permissions is,
 * we want to show it in indefinite state on UI.
 *
 * Returns whether the export permission is indefinite.
 */
export const isExportPermissionIndefinite = (
    permission: WorkspacePermission,
    selectedGranularPermissions: WorkspacePermissions,
) => {
    const isExportPermission = permission === "EXPORT";
    const hasExportPdf = selectedGranularPermissions.includes("EXPORT_PDF");
    const hasExportTabular = selectedGranularPermissions.includes("EXPORT_TABULAR");

    return isExportPermission && ((hasExportPdf && !hasExportTabular) || (!hasExportPdf && hasExportTabular));
};

/**
 * In some cases, we want to disable implicit permissions on UI to avoid confusion in the hierarchy.
 *
 * Returns whether a permission is disabled.
 */
export const isPermissionDisabled = (
    permission: WorkspacePermission,
    selectedWorkspacePermission: WorkspacePermission,
    selectedGranularPermissions: WorkspacePermissions,
) => {
    const isManageWithNoAi = selectedWorkspacePermission === "MANAGE" && permission !== "USE_AI_ASSISTANT";
    const isAnalyzeWithCreateFilterView =
        selectedWorkspacePermission === "ANALYZE" && permission === "CREATE_FILTER_VIEW";
    const isExportSubPermission =
        selectedGranularPermissions.includes("EXPORT") && exportSubPermissions.includes(permission);

    return isManageWithNoAi || isAnalyzeWithCreateFilterView || isExportSubPermission;
};

/**
 * Before persisting permissions, we want to remove implicit permissions as they are not needed on BE.
 *
 * Returns the list of permissions without implicit ones.
 */
export const removeRedundantPermissions = (permissions: WorkspacePermissions): WorkspacePermissions => {
    let sanitizedPermissions: WorkspacePermission[];

    if (permissions.includes("MANAGE")) {
        sanitizedPermissions = ["MANAGE"];
        if (permissions.includes("USE_AI_ASSISTANT")) {
            sanitizedPermissions.push("USE_AI_ASSISTANT");
        }
        return sanitizedPermissions;
    }

    sanitizedPermissions = [...permissions];
    if (permissions.includes("ANALYZE")) {
        sanitizedPermissions = sanitizedPermissions.filter((p) => p !== "VIEW");
        sanitizedPermissions = sanitizedPermissions.filter((p) => p !== "CREATE_FILTER_VIEW");
    }

    if (permissions.includes("EXPORT")) {
        sanitizedPermissions = sanitizedPermissions.filter((p) => p !== "EXPORT_PDF");
        sanitizedPermissions = sanitizedPermissions.filter((p) => p !== "EXPORT_TABULAR");
    }

    return sanitizedPermissions;
};

/**
 * Returns whether two workspaces have the same permissions.
 *
 * Remark: possible implicit permissions are not removed here.
 */
export const areWorkspacePermissionsEqual = (
    workspace1: IGrantedWorkspace,
    workspace2: IGrantedWorkspace,
) => {
    if (workspace1 === undefined || workspace2 === undefined) {
        return false;
    }

    return (
        workspace1.isHierarchical !== workspace2.isHierarchical ||
        !isEqual([...workspace1.permissions].sort(), [...workspace2.permissions].sort())
    );
};

/**
 * Returns reordered permissions with MANAGE, ANALYZE, or VIEW at the first position in this order.
 */
const reorderPermissions = (permissions: WorkspacePermissions): WorkspacePermissions => {
    const permissionOrder = [
        "MANAGE",
        "ANALYZE",
        "VIEW",
        "CREATE_FILTER_VIEW",
        "CREATE_AUTOMATION",
        "EXPORT",
        "EXPORT_PDF",
        "EXPORT_TABULAR",
    ];

    return [...permissions].sort((a, b) => {
        const aIndex = permissionOrder.indexOf(a);
        const bIndex = permissionOrder.indexOf(b);

        if (aIndex === -1 && bIndex === -1) {
            return 0;
        }
        if (aIndex === -1) {
            return 1;
        }
        if (bIndex === -1) {
            return -1;
        }
        return aIndex - bIndex;
    });
};

/**
 * Returns human-readable title of effective permissions for UI description.
 */
export const getHumanReadablePermissionsTitle = (
    permissions: WorkspacePermissions,
    intl: IntlShape,
): string => {
    const reorderedPermissions = reorderPermissions(permissions);
    const effectivePermissions = removeRedundantPermissions(reorderedPermissions);
    const translatedPermissions = effectivePermissions.map((permission) => {
        return intl.formatMessage(workspaceGranularPermissionMessages[permission]);
    });

    if (translatedPermissions.length === 1) {
        return translatedPermissions[0];
    }

    const [firstPermission, ...restPermissions] = translatedPermissions;
    return `${firstPermission} ${intl.formatMessage(
        workspaceGranularPermissionMessages.and,
    )} ${restPermissions.join(", ")}`;
};

/**
 * BE might store redundant permissions like ANALYZE, VIEW in one list.
 *
 * Returns whether redundant permissions are present in the list.
 */
export const areRedundantPermissionsPresent = (permissions: WorkspacePermissions): boolean => {
    const effectivePermissions = removeRedundantPermissions(permissions);
    return !isEqual(effectivePermissions.sort(), permissions.sort());
};
