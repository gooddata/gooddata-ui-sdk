// (C) 2023 GoodData Corporation
import { Api } from "./api";

export class DashboardAccess {
    static assignUserPermissionToDashboard(
        workspaceId: string,
        dashboardId: string,
        userId: string,
        permission: string,
    ) {
        const url = `/api/v1/actions/workspaces/${workspaceId}/analyticalDashboards/${dashboardId}/managePermissions`;
        const body = [
            {
                assigneeIdentifier: {
                    id: userId,
                    type: "user",
                },
                permissions: [permission],
            },
        ];

        Api.request("POST", url, body, { useVendorContentType: false });
    }

    static assignGroupPermissionToDashboard(
        workspaceId: string,
        dashboardId: string,
        groupId: string,
        permission: string,
    ) {
        const url = `/api/v1/actions/workspaces/${workspaceId}/analyticalDashboards/${dashboardId}/managePermissions`;
        const body = [
            {
                assigneeIdentifier: {
                    id: groupId,
                    type: "userGroup",
                },
                permissions: [permission],
            },
        ];

        Api.request("POST", url, body, { useVendorContentType: false });
    }

    static assignRulePermissionToDashboard(workspaceId: string, dashboardId: string, permission?: string) {
        const url = `/api/v1/actions/workspaces/${workspaceId}/analyticalDashboards/${dashboardId}/managePermissions`;
        const body = [
            {
                assigneeRule: {
                    type: "allWorkspaceUsers",
                },
                permissions: permission ? [permission] : [],
            },
        ];

        Api.request("POST", url, body, { useVendorContentType: false });
    }
}

export class WorkspaceAccess {
    static assignUserPermissionToWorkspace(
        workspaceId: string,
        usersAndPermissions: { user: string; permission: string }[],
    ) {
        const url = `/api/v1/layout/workspaces/${workspaceId}/permissions`;
        const body = {
            permissions: usersAndPermissions.map(({ user, permission }) => {
                return {
                    assignee: {
                        id: user,
                        type: "user",
                    },
                    name: permission,
                };
            }),
        };

        Api.request("PUT", url, body, { useVendorContentType: false });
    }
}
