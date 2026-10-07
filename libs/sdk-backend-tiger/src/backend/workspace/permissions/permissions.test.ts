// (C) 2020-2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { JsonApiWorkspaceOutMetaPermissionsEnum } from "@gooddata/api-client-tiger";
import type { EntitiesApi_GetEntityWorkspaces } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { TigerWorkspacePermissionsFactory } from "./index.js";

type TigerPermissionType = JsonApiWorkspaceOutMetaPermissionsEnum;

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

    const factoryFor = (authCall: ReturnType<typeof getWithDefinedPermissions>[0]) =>
        new TigerWorkspacePermissionsFactory(authCall as unknown as TigerAuthenticatedCallGuard, workspaceId);
    const createFactory = (permissions: Array<TigerPermissionType>) =>
        factoryFor(getWithDefinedPermissions(permissions)[0]);

    it("test VIEW permissions", async () => {
        const [authCall, axiosRequest] = getWithDefinedPermissions(["VIEW"]);

        const workspacePermissions = await factoryFor(authCall).getPermissionsForCurrentUser();

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
            canAnalyzeWorkspace: false,
            canCreateVisualization: false,
            canCreateComputedAttribute: false,
            canManageVisualizations: false,
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

        const workspacePermissions = await factoryFor(authCall).getPermissionsForCurrentUser();

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
            canAnalyzeWorkspace: true,
            canCreateVisualization: true,
            canCreateComputedAttribute: false,
            canManageVisualizations: false,
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

        const workspacePermissions = await factoryFor(authCall).getPermissionsForCurrentUser();

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
            canAnalyzeWorkspace: true,
            canCreateVisualization: true,
            canCreateComputedAttribute: false,
            canManageVisualizations: true,
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
        const granted = await createFactory([
            "ANALYZE",
            "VIEW",
            "CREATE_METRIC",
        ]).getPermissionsForCurrentUser();
        const notGranted = await createFactory(["ANALYZE", "VIEW"]).getPermissionsForCurrentUser();

        expect(granted.canCreateMetric).toBe(true);
        expect(notGranted.canCreateMetric).toBe(false);
    });

    it("lets CREATE_VISUALIZATION on top of VIEW create visualizations without the ANALYZE role", async () => {
        const granted = await createFactory(["VIEW", "CREATE_VISUALIZATION"]).getPermissionsForCurrentUser();
        const viewer = await createFactory(["VIEW"]).getPermissionsForCurrentUser();
        const analyst = await createFactory(["ANALYZE", "VIEW"]).getPermissionsForCurrentUser();
        expect(granted.canCreateVisualization).toBe(true);
        expect(granted.canAnalyzeWorkspace).toBe(false);
        expect(viewer.canCreateVisualization).toBe(false);
        expect(analyst.canCreateVisualization).toBe(true);
    });

    it("lets MANAGE_VISUALIZATIONS on top of VIEW manage and create visualizations", async () => {
        const holder = await createFactory(["VIEW", "MANAGE_VISUALIZATIONS"]).getPermissionsForCurrentUser();
        const manager = await createFactory(["MANAGE", "ANALYZE", "VIEW"]).getPermissionsForCurrentUser();
        const analyst = await createFactory(["ANALYZE", "VIEW"]).getPermissionsForCurrentUser();
        expect(holder.canManageVisualizations).toBe(true);
        expect(holder.canCreateVisualization).toBe(true);
        expect(holder.canAnalyzeWorkspace).toBe(false);
        expect(manager.canManageVisualizations).toBe(true);
        expect(analyst.canManageVisualizations).toBe(false);
    });

    it("maps the granular CREATE_COMPUTED_ATTRIBUTE permission", async () => {
        const granted = await createFactory([
            "VIEW",
            "CREATE_COMPUTED_ATTRIBUTE",
        ]).getPermissionsForCurrentUser();
        const analyst = await createFactory(["ANALYZE", "VIEW"]).getPermissionsForCurrentUser();

        expect(granted.canCreateComputedAttribute).toBe(true);
        expect(analyst.canCreateComputedAttribute).toBe(false);
    });
});
