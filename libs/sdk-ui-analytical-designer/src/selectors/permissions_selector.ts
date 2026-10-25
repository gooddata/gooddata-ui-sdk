// (C) 2019-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IWorkspacePermissions, type WorkspacePermission } from "@gooddata/sdk-model";

import { getWorkspacePermissionsState } from "../store/permissions/permissions_selectors.js";
import { type IAppState } from "../store/types.js";

import { isCreateReportSupported } from "./backend_capabilities_selector.js";

export const Permissions: {
    CAN_ACCESS_WORKBENCH: WorkspacePermission;
    CAN_MANAGE_PROJECT: WorkspacePermission;
    CAN_MANAGE_REPORT: WorkspacePermission;
    CAN_MANAGE_ANALYTICAL_DASHBOARD: WorkspacePermission;
    CAN_MANAGE_METRIC: WorkspacePermission;
    CAN_CREATE_METRIC: WorkspacePermission;
    CAN_UPLOAD_NON_PRODUCTION_CSV: WorkspacePermission;
    CAN_CREATE_REPORT: WorkspacePermission;
    CAN_EXECUTE_RAW: WorkspacePermission;
    CAN_EXPORT_REPORT: WorkspacePermission;
    CAN_EXPORT_TABULAR: WorkspacePermission;
    CAN_EXPORT_PDF: WorkspacePermission;
    CAN_ANALYZE_WORKSPACE: WorkspacePermission;
    CAN_CREATE_VISUALIZATION: WorkspacePermission;
    CAN_MANAGE_DOMAIN: WorkspacePermission;
    CAN_INIT_DATA: WorkspacePermission;
    CAN_USE_AI_ASSISTANT: WorkspacePermission;
} = {
    CAN_ACCESS_WORKBENCH: "canAccessWorkbench",
    CAN_MANAGE_PROJECT: "canManageProject",
    CAN_MANAGE_REPORT: "canManageReport",
    CAN_MANAGE_ANALYTICAL_DASHBOARD: "canManageAnalyticalDashboard",
    CAN_MANAGE_METRIC: "canManageMetric",
    CAN_CREATE_METRIC: "canCreateMetric",
    CAN_UPLOAD_NON_PRODUCTION_CSV: "canUploadNonProductionCSV",
    CAN_CREATE_REPORT: "canCreateReport",
    CAN_ANALYZE_WORKSPACE: "canAnalyzeWorkspace",
    CAN_CREATE_VISUALIZATION: "canCreateVisualization",
    CAN_EXECUTE_RAW: "canExecuteRaw",
    CAN_EXPORT_REPORT: "canExportReport",
    CAN_EXPORT_TABULAR: "canExportTabular",
    CAN_EXPORT_PDF: "canExportPdf",
    CAN_MANAGE_DOMAIN: "canManageDomain",
    CAN_INIT_DATA: "canInitData",
    CAN_USE_AI_ASSISTANT: "canUseAiAssistant",
};

export const workspacePermissions = (state: IAppState): IWorkspacePermissions | null =>
    getWorkspacePermissionsState(state);

export const hasWorkspacePermission = (permission: WorkspacePermission) =>
    createSelector(
        [workspacePermissions],
        (permissions) => !!permissions && permissions[permission] === true,
    );

export const canManageProject = hasWorkspacePermission(Permissions.CAN_MANAGE_PROJECT);
export const canAccessWorkbench = hasWorkspacePermission(Permissions.CAN_ACCESS_WORKBENCH);
export const canManageDomain = hasWorkspacePermission(Permissions.CAN_MANAGE_DOMAIN);
export const canManageMetric = hasWorkspacePermission(Permissions.CAN_MANAGE_METRIC);
export const canCreateReport = createSelector(
    hasWorkspacePermission(Permissions.CAN_CREATE_REPORT),
    isCreateReportSupported,
    (hasPermissions, hasSupport) => hasPermissions && hasSupport,
);
export const canAnalyzeWorkspace = hasWorkspacePermission(Permissions.CAN_ANALYZE_WORKSPACE);
export const canCreateVisualization = hasWorkspacePermission(Permissions.CAN_CREATE_VISUALIZATION);

export const canCreateNewVisualization = createSelector(
    canCreateReport,
    canCreateVisualization,
    (canCreateReport, canCreateVisualization) => canCreateReport || canCreateVisualization,
);
export const canExecuteRaw = hasWorkspacePermission(Permissions.CAN_EXECUTE_RAW);
export const canManageAnalyticalDashboard = hasWorkspacePermission(
    Permissions.CAN_MANAGE_ANALYTICAL_DASHBOARD,
);

export const canExportTabular = createSelector(
    hasWorkspacePermission(Permissions.CAN_EXPORT_REPORT),
    hasWorkspacePermission(Permissions.CAN_EXPORT_TABULAR),
    (exportReport, exportTabular) => exportReport || exportTabular,
);

export const canUseAiAssistant = hasWorkspacePermission(Permissions.CAN_USE_AI_ASSISTANT);
