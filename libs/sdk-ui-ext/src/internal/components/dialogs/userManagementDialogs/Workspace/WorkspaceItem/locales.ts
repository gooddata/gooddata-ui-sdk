// (C) 2023-2024 GoodData Corporation

import { defineMessages } from "react-intl";
import { WorkspacePermission } from "../../types.js";

export const hierarchicalPermissionMessages = defineMessages({
    enabled: { id: "userManagement.workspace.hierarchicalPermission.yes" },
    disabled: { id: "userManagement.workspace.hierarchicalPermission.no" },
});

export const workspacePermissionMessages = defineMessages({
    VIEW: { id: "userManagement.workspace.permission.view" },
    VIEW_AND_SAVE_VIEWS: { id: "userManagement.workspace.permission.viewSaveViews" },
    VIEW_AND_EXPORT: { id: "userManagement.workspace.permission.viewExport" },
    VIEW_AND_EXPORT_AND_SAVE_VIEWS: { id: "userManagement.workspace.permission.viewExportSaveViews" },
    ANALYZE: { id: "userManagement.workspace.permission.analyze" },
    ANALYZE_AND_EXPORT: { id: "userManagement.workspace.permission.analyzeExport" },
    MANAGE: { id: "userManagement.workspace.permission.manage" },
    remove: { id: "userManagement.workspace.permission.remove" },
});

export const getPermissionTitle = (permission: WorkspacePermission) => {
    switch (permission) {
        case "VIEW":
            return workspacePermissionMessages.VIEW;
        case "VIEW_AND_SAVE_VIEWS":
            return workspacePermissionMessages.VIEW_AND_SAVE_VIEWS;
        case "VIEW_AND_EXPORT":
            return workspacePermissionMessages.VIEW_AND_EXPORT;
        case "VIEW_AND_EXPORT_AND_SAVE_VIEWS":
            return workspacePermissionMessages.VIEW_AND_EXPORT_AND_SAVE_VIEWS;
        case "ANALYZE":
            return workspacePermissionMessages.ANALYZE;
        case "ANALYZE_AND_EXPORT":
            return workspacePermissionMessages.ANALYZE_AND_EXPORT;
        case "MANAGE":
            return workspacePermissionMessages.MANAGE;
        default:
            throw new Error("There's no localization key for the unsupported permission.");
    }
};
