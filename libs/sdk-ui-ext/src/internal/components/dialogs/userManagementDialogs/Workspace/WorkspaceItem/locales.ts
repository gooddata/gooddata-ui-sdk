// (C) 2023-2025 GoodData Corporation

import { defineMessages } from "react-intl";
import { WorkspacePermission, WorkspacePermissions } from "../../types.js";

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

export const workspaceGranularPermissionMessages = defineMessages({
    MANAGE: { id: "userManagement.workspace.permission.manage" },
    ANALYZE: { id: "userManagement.workspace.permission.analyze" },
    VIEW: { id: "userManagement.workspace.permission.view" },
    EXPORT: { id: "userManagement.workspace.permission.export" },
    EXPORT_TABULAR: { id: "userManagement.workspace.permission.exportTabular" },
    EXPORT_PDF: { id: "userManagement.workspace.permission.exportPdf" },
    CREATE_FILTER_VIEW: { id: "userManagement.workspace.permission.createFilterView" },
    CREATE_AUTOMATION: { id: "userManagement.workspace.permission.createAutomation" },
    USE_AI_ASSISTANT: { id: "userManagement.workspace.permission.useAiAssistant" },
    viewDescription: { id: "userManagement.workspace.granularPermission.view.description" },
    analyzeDescription: { id: "userManagement.workspace.granularPermission.analyze.description" },
    manageDescription: { id: "userManagement.workspace.granularPermission.manage.description" },
    hierarchyTooltip: { id: "userManagement.workspace.granularPermission.hierarchy.tooltip" },
    remove: { id: "userManagement.workspace.permission.remove" },
    and: { id: "userManagement.workspace.permission.and" },
});

export const granularTooltipMessages = defineMessages({
    EXPORT: { id: "userManagement.workspace.permission.export.tooltip" },
    EXPORT_TABULAR: { id: "userManagement.workspace.permission.exportTabular.tooltip" },
    EXPORT_PDF: { id: "userManagement.workspace.permission.exportPdf.tooltip" },
    CREATE_FILTER_VIEW: { id: "userManagement.workspace.permission.createFilterView.tooltip" },
    CREATE_AUTOMATION: { id: "userManagement.workspace.permission.createAutomation.tooltip" },
    USE_AI_ASSISTANT: { id: "userManagement.workspace.permission.useAiAssistant.tooltip" },
});

export const getGranularPermissionTitle = (permission: WorkspacePermission) => {
    switch (permission) {
        case "MANAGE":
            return workspaceGranularPermissionMessages.MANAGE;
        case "ANALYZE":
            return workspaceGranularPermissionMessages.ANALYZE;
        case "EXPORT":
            return workspaceGranularPermissionMessages.EXPORT;
        case "EXPORT_TABULAR":
            return workspaceGranularPermissionMessages.EXPORT_TABULAR;
        case "EXPORT_PDF":
            return workspaceGranularPermissionMessages.EXPORT_PDF;
        case "CREATE_FILTER_VIEW":
            return workspaceGranularPermissionMessages.CREATE_FILTER_VIEW;
        case "VIEW":
            return workspaceGranularPermissionMessages.VIEW;
        case "CREATE_AUTOMATION":
            return workspaceGranularPermissionMessages.CREATE_AUTOMATION;
        case "USE_AI_ASSISTANT":
            return workspaceGranularPermissionMessages.USE_AI_ASSISTANT;
        default:
            throw new Error("There's no localization key for the unsupported permission.");
    }
};

export const getGranularPermissionButtonTitle = (permissions: WorkspacePermissions) => {
    if (permissions.includes("MANAGE")) {
        return workspaceGranularPermissionMessages.MANAGE;
    } else if (permissions.includes("ANALYZE")) {
        return workspaceGranularPermissionMessages.ANALYZE;
    } else {
        return workspaceGranularPermissionMessages.VIEW;
    }
};

export const getWorkspaceAccessPermissionDescription = (permission: WorkspacePermission) => {
    switch (permission) {
        case "MANAGE":
            return workspaceGranularPermissionMessages.manageDescription;
        case "ANALYZE":
            return workspaceGranularPermissionMessages.analyzeDescription;
        case "VIEW":
            return workspaceGranularPermissionMessages.viewDescription;
        default:
            throw new Error("There's no localization key for the unsupported main permission.");
    }
};
