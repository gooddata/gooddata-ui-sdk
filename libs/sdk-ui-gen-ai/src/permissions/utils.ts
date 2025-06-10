// (C) 2025 GoodData Corporation
import { IWorkspacePermissions } from "@gooddata/sdk-model";

export function emptyWorkspacePermissions(): Partial<IWorkspacePermissions> {
    return {
        canAccessWorkbench: false,
        canCreateAnalyticalDashboard: false,
        canCreateReport: false,
        canCreateScheduledMail: false,
        canCreateVisualization: false,
        canExecuteRaw: false,
        canExportReport: false,
        canInitData: false,
        canInviteUserToProject: false,
        canListUsersInProject: false,
        canManageACL: false,
        canManageAnalyticalDashboard: false,
        canManageDomain: false,
        canManageMetric: false,
        canManageProject: false,
        canManageReport: false,
        canRefreshData: false,
        canUploadNonProductionCSV: false,
        canManageScheduledMail: false,
        canExportPdf: false,
        canExportTabular: false,
        canCreateFilterView: false,
        canCreateAutomation: false,
        canUseAiAssistant: false,
    };
}
