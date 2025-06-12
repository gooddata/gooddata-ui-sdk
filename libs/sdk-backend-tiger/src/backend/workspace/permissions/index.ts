// (C) 2019-2025 GoodData Corporation
import { IWorkspacePermissionsService } from "@gooddata/sdk-backend-spi";
import { IWorkspacePermissions } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { GET_OPTIMIZED_WORKSPACE_PARAMS } from "../constants.js";

// TODO:
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

export class TigerWorkspacePermissionsFactory implements IWorkspacePermissionsService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getPermissionsForCurrentUser(): Promise<IWorkspacePermissions> {
        const response = await this.authCall((client) =>
            client.entities.getEntityWorkspaces({
                id: this.workspace,
                ...GET_OPTIMIZED_WORKSPACE_PARAMS,
            }),
        );
        // NOTE: From tiger backend there are permissions like MANAGE, ANALYZE, VIEW. Keep on mind that
        // NOTE: if user has MANAGE permissions, there will be also ANALYZE and VIEW in permissions array.
        const permissions = response.data.data.meta!.permissions ?? ([] as Array<TigerPermissionType>);
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

function hasPermission(permissions: Array<TigerPermissionType>, need: TigerPermissionType) {
    return permissions.indexOf(need) >= 0;
}
