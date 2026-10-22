// (C) 2021-2026 GoodData Corporation

import { mapValues } from "lodash-es";

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

export const makeWorkspacePermissions = (
    permissions: Partial<IWorkspacePermissions> = {},
): IWorkspacePermissions => {
    return {
        canAccessWorkbench: false,
        canCreateAnalyticalDashboard: false,
        canCreateReport: false,
        canInitData: false,
        canCreateScheduledMail: false,
        canAnalyzeWorkspace: false,
        canCreateVisualization: false,
        canCreateComputedAttribute: false,
        canManageVisualizations: false,
        canExecuteRaw: false,
        canExportReport: false,
        canExportTabular: false,
        canExportPdf: false,
        canListUsersInProject: false,
        canManageAnalyticalDashboard: false,
        canManageDomain: false,
        canCreateMetric: false,
        canManageMetric: false,
        canManageProject: false,
        canManageReport: false,
        canManageScheduledMail: false,
        canUploadNonProductionCSV: false,
        canInviteUserToProject: false,
        canRefreshData: false,
        canManageACL: false,
        canCreateAutomation: false,
        canCreateFilterView: false,
        canUseAiAssistant: false,
        ...permissions,
    };
};

export const makeFullWorkspacePermissions = (
    permissions: Partial<IWorkspacePermissions> = {},
): IWorkspacePermissions => {
    return {
        ...mapValues(makeWorkspacePermissions(), () => true),
        ...permissions,
    };
};
