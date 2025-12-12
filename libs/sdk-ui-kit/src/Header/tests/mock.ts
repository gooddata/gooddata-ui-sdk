// (C) 2021-2025 GoodData Corporation

import { type ISettings, type IWorkspacePermissions, type PlatformEdition } from "@gooddata/sdk-model";

export const getHelpMenuFeatureFlagsMock = (
    enableUniversityHelpMenuItem: boolean,
    enableCommunityHelpMenuItem: boolean,
): ISettings => {
    return {
        enableUniversityHelpMenuItem,
        enableCommunityHelpMenuItem,
    };
};

export const getAccountMenuFeatureFlagsMock = (
    enableDataSection: boolean,
    platformEdition: PlatformEdition,
): ISettings => {
    return {
        enableDataSection,
        platformEdition,
    };
};

export const getWorkspacePermissionsMock = (
    canInitData: boolean,
    canManageMetric: boolean,
    canManageProject = true,
): IWorkspacePermissions => {
    return {
        canAccessWorkbench: true,
        canCreateAnalyticalDashboard: true,
        canCreateReport: true,
        canInitData,
        canCreateScheduledMail: true,
        canCreateVisualization: true,
        canExecuteRaw: true,
        canExportReport: true,
        canExportTabular: true,
        canExportPdf: true,
        canListUsersInProject: true,
        canManageAnalyticalDashboard: true,
        canManageDomain: true,
        canManageMetric,
        canManageProject,
        canManageReport: true,
        canManageScheduledMail: true,
        canUploadNonProductionCSV: true,
        canInviteUserToProject: true,
        canRefreshData: true,
        canManageACL: true,
        canCreateAutomation: false,
        canCreateFilterView: false,
        canUseAiAssistant: false,
    };
};
