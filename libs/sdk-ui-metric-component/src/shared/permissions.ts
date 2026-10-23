// (C) 2022-2026 GoodData Corporation

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

export interface IOrganizationPermissions {
    hasOrgManagePermission: boolean;
    hasBaseUiAccessPermission?: boolean;
}

export function emptyWorkspacePermissions(): IWorkspacePermissions {
    return {
        canAccessWorkbench: false,
        canCreateAnalyticalDashboard: false,
        canCreateReport: false,
        canCreateScheduledMail: false,
        canAnalyzeWorkspace: false,
        canCreateVisualization: false,
        canCreateComputedAttribute: false,
        canManageVisualizations: false,
        canExecuteRaw: false,
        canExportReport: false,
        canInitData: false,
        canInviteUserToProject: false,
        canListUsersInProject: false,
        canManageACL: false,
        canManageAnalyticalDashboard: false,
        canManageDomain: false,
        canCreateMetric: false,
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

export function emptyOrganizationPermissions(): IOrganizationPermissions {
    return {
        hasOrgManagePermission: false,
        hasBaseUiAccessPermission: true,
    };
}

export function fullWorkspacePermissions(): IWorkspacePermissions {
    const permissions = {} as IWorkspacePermissions;
    (Object.keys(emptyWorkspacePermissions()) as Array<keyof IWorkspacePermissions>).forEach((key) => {
        permissions[key] = true;
    });
    return permissions;
}

export function fullOrganizationPermissions(): IOrganizationPermissions {
    const permissions = {} as IOrganizationPermissions;
    (Object.keys(emptyOrganizationPermissions()) as Array<keyof IOrganizationPermissions>).forEach((key) => {
        permissions[key] = true;
    });
    return permissions;
}
