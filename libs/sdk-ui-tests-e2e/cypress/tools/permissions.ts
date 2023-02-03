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
}

export class WorkspaceAccess {
    static assignUserPermissionToWorkspace(workspaceId: string, userId: string, permission: string) {
        const url = `/api/v1/layout/workspaces/${workspaceId}/permissions`;
        const body = {
            permissions: [
                {
                    assignee: {
                        id: userId,
                        type: "user",
                    },
                    name: permission,
                },
            ],
        };

        Api.request("PUT", url, body, { useVendorContentType: false });
    }
}
