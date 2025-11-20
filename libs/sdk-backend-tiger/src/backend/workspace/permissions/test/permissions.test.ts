// (C) 2020-2025 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { EntitiesApi_GetEntityWorkspaces } from "@gooddata/api-client-tiger/entitiesObjects";
import type { IWorkspacePermissions } from "@gooddata/sdk-model";

import { GET_OPTIMIZED_WORKSPACE_PARAMS } from "../../constants.js";

type TigerPermissionType =
    | "MANAGE"
    | "VIEW"
    | "ANALYZE"
    | "EXPORT"
    | "EXPORT_TABULAR"
    | "EXPORT_PDF"
    | "USE_AI_ASSISTANT"
    | "CREATE_FILTER_VIEW"
    | "CREATE_AUTOMATION";

function hasPermission(permissions: Array<TigerPermissionType>, need: TigerPermissionType): boolean {
    return permissions.indexOf(need) >= 0;
}

function getPermission(permissions: Array<TigerPermissionType>) {
    const canViewWorkspace = hasPermission(permissions, "VIEW");
    const canAnalyzeWorkspace = hasPermission(permissions, "ANALYZE");
    const canManageWorkspace = hasPermission(permissions, "MANAGE");
    const canExportReport = hasPermission(permissions, "EXPORT");
    const canExportTabular = hasPermission(permissions, "EXPORT_TABULAR");
    const canExportPdf = hasPermission(permissions, "EXPORT_PDF");
    const canCreateFilterView = hasPermission(permissions, "CREATE_FILTER_VIEW");
    const canCreateAutomation = hasPermission(permissions, "CREATE_AUTOMATION");
    const canUseAiAssistant = hasPermission(permissions, "USE_AI_ASSISTANT");

    return {
        canViewWorkspace,
        canAnalyzeWorkspace,
        canManageWorkspace,
        canExportReport,
        canExportTabular,
        canExportPdf,
        canCreateFilterView,
        canCreateAutomation,
        canUseAiAssistant,
    };
}

function processPermissions(permissions: Array<TigerPermissionType>): IWorkspacePermissions {
    const {
        canViewWorkspace,
        canAnalyzeWorkspace,
        canManageWorkspace,
        canExportReport,
        canExportTabular,
        canExportPdf,
        canCreateFilterView,
        canCreateAutomation,
        canUseAiAssistant,
    } = getPermission(permissions);

    return {
        //disabled for tiger for now
        canCreateReport: false,
        canUploadNonProductionCSV: false,
        canManageACL: false,
        canManageDomain: false,
        canInviteUserToProject: false,
        canCreateScheduledMail: false,
        canManageScheduledMail: false,
        canListUsersInProject: false,
        //based on group: VIEW
        canAccessWorkbench: canViewWorkspace,
        canExecuteRaw: canViewWorkspace,
        //based on group: ANALYZE
        canCreateVisualization: canAnalyzeWorkspace,
        canManageAnalyticalDashboard: canAnalyzeWorkspace,
        canCreateAnalyticalDashboard: canAnalyzeWorkspace,
        canManageMetric: canAnalyzeWorkspace,
        canManageReport: canAnalyzeWorkspace,
        canRefreshData: canAnalyzeWorkspace,
        canUseAiAssistant: canUseAiAssistant,
        //based on group: MANAGE
        canManageProject: canManageWorkspace,
        //NOTE: Data source MANAGE in future
        canInitData: canManageWorkspace,
        //export
        canExportReport,
        canExportTabular: canExportTabular || canExportReport,
        canExportPdf: canExportPdf || canExportReport,
        canCreateFilterView,
        canCreateAutomation,
    };
}

describe("TigerWorkspacePermissionsFactory", () => {
    const workspaceId = "workspaceId";

    function getWithDefinedPermissions(
        permissions: Array<TigerPermissionType>,
    ): [ReturnType<typeof vi.fn>, ReturnType<typeof vi.fn>] {
        const authCall = vi.fn();
        const axiosRequest = vi.fn();

        const axiosInstance = {
            request: axiosRequest,
        } as any;

        authCall.mockImplementation((handler) => {
            return handler({ axios: axiosInstance });
        });
        axiosRequest.mockImplementation(() => {
            return Promise.resolve({ data: { data: { meta: { permissions } } } });
        });
        return [authCall, axiosRequest];
    }

    it("test VIEW permissions", async () => {
        const [authCall, axiosRequest] = getWithDefinedPermissions(["VIEW"]);

        const response = await authCall((client: { axios: any; basePath: string }) =>
            EntitiesApi_GetEntityWorkspaces(client.axios, client.basePath, {
                id: workspaceId,
                ...GET_OPTIMIZED_WORKSPACE_PARAMS,
            }),
        );

        const permissions = response.data.data.meta!.permissions ?? ([] as Array<TigerPermissionType>);
        const workspacePermissions = processPermissions(permissions);

        expect(axiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining(`/api/v1/entities/workspaces/${workspaceId}`),
            }),
        );
        expect(workspacePermissions).toEqual({
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: false,
            canCreateAutomation: false,
            canCreateReport: false,
            canCreateScheduledMail: false,
            canCreateVisualization: false,
            canExecuteRaw: true,
            canExportReport: false,
            canExportTabular: false,
            canExportPdf: false,
            canInitData: false,
            canInviteUserToProject: false,
            canListUsersInProject: false,
            canManageACL: false,
            canManageAnalyticalDashboard: false,
            canManageDomain: false,
            canManageMetric: false,
            canManageProject: false,
            canManageReport: false,
            canManageScheduledMail: false,
            canRefreshData: false,
            canUploadNonProductionCSV: false,
            canCreateFilterView: false,
            canUseAiAssistant: false,
        });
    });

    it("test ANALYZE permissions", async () => {
        const [authCall, axiosRequest] = getWithDefinedPermissions(["ANALYZE", "VIEW"]);

        const response = await authCall((client: { axios: any; basePath: string }) =>
            EntitiesApi_GetEntityWorkspaces(client.axios, client.basePath, {
                id: workspaceId,
                ...GET_OPTIMIZED_WORKSPACE_PARAMS,
            }),
        );

        const permissions = response.data.data.meta!.permissions ?? ([] as Array<TigerPermissionType>);
        const workspacePermissions = processPermissions(permissions);

        expect(axiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining(`/api/v1/entities/workspaces/${workspaceId}`),
            }),
        );
        expect(workspacePermissions).toEqual({
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: true,
            canCreateAutomation: false,
            canCreateReport: false,
            canCreateScheduledMail: false,
            canCreateVisualization: true,
            canExecuteRaw: true,
            canExportReport: false,
            canExportTabular: false,
            canExportPdf: false,
            canInitData: false,
            canInviteUserToProject: false,
            canListUsersInProject: false,
            canManageACL: false,
            canManageAnalyticalDashboard: true,
            canManageDomain: false,
            canManageMetric: true,
            canManageProject: false,
            canManageReport: true,
            canManageScheduledMail: false,
            canRefreshData: true,
            canUploadNonProductionCSV: false,
            canCreateFilterView: false,
            canUseAiAssistant: false,
        });
    });

    it("test MANAGE permissions", async () => {
        const [authCall, axiosRequest] = getWithDefinedPermissions(["MANAGE", "ANALYZE", "VIEW"]);

        const response = await authCall((client: { axios: any; basePath: string }) =>
            EntitiesApi_GetEntityWorkspaces(client.axios, client.basePath, {
                id: workspaceId,
                ...GET_OPTIMIZED_WORKSPACE_PARAMS,
            }),
        );

        const permissions = response.data.data.meta!.permissions ?? ([] as Array<TigerPermissionType>);
        const workspacePermissions = processPermissions(permissions);

        expect(axiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining(`/api/v1/entities/workspaces/${workspaceId}`),
            }),
        );
        expect(workspacePermissions).toEqual({
            canAccessWorkbench: true,
            canCreateAnalyticalDashboard: true,
            canCreateAutomation: false,
            canCreateReport: false,
            canCreateScheduledMail: false,
            canCreateVisualization: true,
            canExecuteRaw: true,
            canExportReport: false,
            canExportTabular: false,
            canExportPdf: false,
            canInitData: true,
            canInviteUserToProject: false,
            canListUsersInProject: false,
            canManageACL: false,
            canManageAnalyticalDashboard: true,
            canManageDomain: false,
            canManageMetric: true,
            canManageProject: true,
            canManageReport: true,
            canManageScheduledMail: false,
            canRefreshData: true,
            canUploadNonProductionCSV: false,
            canCreateFilterView: false,
            canUseAiAssistant: false,
        });
    });
});
