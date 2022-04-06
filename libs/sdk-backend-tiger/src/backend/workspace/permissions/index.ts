// (C) 2019-2022 GoodData Corporation
import { IWorkspacePermissionsService } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";

type TigerPermissionType = "MANAGE" | "VIEW" | "ANALYZE";

export class TigerWorkspacePermissionsFactory implements IWorkspacePermissionsService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getPermissionsForCurrentUser(): Promise<IWorkspacePermissions> {
        // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
        const response = await this.authCall((client) =>
            client.axios.get(`/api/entities/workspaces/${this.workspace}?metaInclude=permissions`),
        );
        // NOTE: From tiger backend there are permissions like MANAGE, ANALYZE, VIEW. Keep on mind that
        // NOTE: if user has MANAGE permissions, there will be also ANALYZE and VIEW in permissions array.
        const permissions = response.data.data.meta.permissions as Array<TigerPermissionType>;
        const { canViewWorkspace, canAnalyzeWorkspace, canManageWorkspace } = getPermission(permissions);

        return {
            //disabled for tiger for now
            canCreateReport: false,
            canExportReport: false,
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
            //based on group: MANAGE
            canManageProject: canManageWorkspace,
            //NOTE: Data source MANAGE in future
            canInitData: canManageWorkspace,
        };
    }
}

function getPermission(permissions: Array<TigerPermissionType>) {
    const canViewWorkspace = hasPermission(permissions, "VIEW");
    const canAnalyzeWorkspace = hasPermission(permissions, "ANALYZE");
    const canManageWorkspace = hasPermission(permissions, "MANAGE");

    return {
        canViewWorkspace,
        canAnalyzeWorkspace,
        canManageWorkspace,
    };
}

function hasPermission(permissions: Array<TigerPermissionType>, need: TigerPermissionType) {
    return permissions.indexOf(need) >= 0;
}
