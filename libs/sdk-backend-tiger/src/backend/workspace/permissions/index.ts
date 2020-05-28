// (C) 2019-2020 GoodData Corporation
import { IWorkspacePermissionsFactory, IWorkspaceUserPermissions } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions, WorkspacePermission } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";

export class TigerWorkspacePermissionsFactory implements IWorkspacePermissionsFactory {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async forCurrentUser(): Promise<IWorkspaceUserPermissions> {
        const permissions = await this.authCall(async () => {
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
            };
            return result;
        });
        return new TigerWorkspaceUserPermissions(permissions);
    }
}

export class TigerWorkspaceUserPermissions implements IWorkspaceUserPermissions {
    constructor(public readonly permissions: IWorkspacePermissions) {}

    public allPermissions(): IWorkspacePermissions {
        return { ...this.permissions };
    }

    public hasPermission(permission: WorkspacePermission): boolean {
        return this.permissions[permission] === true;
    }
}
