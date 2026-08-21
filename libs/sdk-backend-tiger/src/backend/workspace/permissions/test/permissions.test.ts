// (C) 2020-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { JsonApiWorkspaceOutMetaPermissionsEnum } from "@gooddata/api-client-tiger";
import { EntitiesApi_GetEntityWorkspaces } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import type { IWorkspacePermissions } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../../types/index.js";
import { GET_OPTIMIZED_WORKSPACE_PARAMS } from "../../constants.js";
import { TigerWorkspacePermissionsFactory } from "../index.js";

type TigerPermissionType = JsonApiWorkspaceOutMetaPermissionsEnum;

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
    const canCreateMetric = hasPermission(permissions, "CREATE_METRIC");

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
        canCreateMetric,
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
        canCreateMetric,
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
        canCreateMetric,
    };
}

describe("TigerWorkspacePermissionsFactory", () => {
    const workspaceId = "workspaceId";

    function getWithDefinedPermissions(permissions: Array<TigerPermissionType>) {
        const axiosRequest = vi.fn(() => Promise.resolve({ data: { data: { meta: { permissions } } } }));

        const axiosInstance = {
            request: axiosRequest,
        };

        const authCall = vi.fn(
            (
                handler: (client: {
                    axios: unknown;
                    basePath: string;
                }) => ReturnType<typeof EntitiesApi_GetEntityWorkspaces>,
            ) => handler({ axios: axiosInstance, basePath: "" }),
        );

        return [authCall, axiosRequest] as const;
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
            canCreateMetric: false,
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
            canCreateMetric: false,
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
            canCreateMetric: false,
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

    it("maps the granular CREATE_METRIC permission", async () => {
        const createFactory = (permissions: Array<TigerPermissionType>) =>
            new TigerWorkspacePermissionsFactory(
                getWithDefinedPermissions(permissions)[0] as unknown as TigerAuthenticatedCallGuard,
                workspaceId,
            );

        const granted = await createFactory([
            "ANALYZE",
            "VIEW",
            "CREATE_METRIC",
        ]).getPermissionsForCurrentUser();
        const notGranted = await createFactory(["ANALYZE", "VIEW"]).getPermissionsForCurrentUser();

        expect(granted.canCreateMetric).toBe(true);
        expect(notGranted.canCreateMetric).toBe(false);
    });
});
