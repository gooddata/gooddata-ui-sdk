// (C) 2019-2021 GoodData Corporation
import { IWorkspacePermissionsService, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";

export class TigerWorkspacePermissionsFactory implements IWorkspacePermissionsService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getPermissionsForCurrentUser(): Promise<IWorkspacePermissions> {
        return await this.authCall(async () => {
            const result: IWorkspacePermissions = {
                canAccessWorkbench: true,
                canCreateReport: true,
                canCreateVisualization: true,
                canExecuteRaw: true,
                canExportReport: true,
                canManageAnalyticalDashboard: true,
                canUploadNonProductionCSV: true,
                canManageProject: true,
                canCreateAnalyticalDashboard: true,
                canInitData: true,
                canManageMetric: true,
                canManageReport: true,
                canCreateScheduledMail: true,
                canListUsersInProject: true,
                canManageDomain: true,
                canInviteUserToProject: true,
            };
            return result;
        });
    }
}
