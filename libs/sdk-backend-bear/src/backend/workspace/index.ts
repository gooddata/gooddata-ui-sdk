// (C) 2019-2021 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IExecutionFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspacePermissionsService,
    IWorkspaceInsightsService,
    IWorkspaceDashboardsService,
    IWorkspaceUsersQuery,
    IDateFilterConfigsQuery,
    IWorkspaceAttributesService,
    IWorkspaceMeasuresService,
    IWorkspaceFactsService,
    IWorkspaceDescriptor,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
} from "@gooddata/sdk-backend-spi";
import { BearExecution } from "./execution/executionFactory";
import { BearWorkspaceMeasures } from "./measures";
import { BearWorkspaceStyling } from "./styling/styling";
import { BearWorkspaceCatalogFactory } from "./catalog/factory";
import { BearWorkspaceSettings } from "./settings/settings";
import { BearWorkspacePermissionsFactory } from "./permissions/permissions";
import { BearWorkspaceInsights } from "./insights";
import { BearWorkspaceDataSets } from "./datasets";
import { BearWorkspaceDashboards } from "./dashboards";
import { BearAuthenticatedCallGuard } from "../../types/auth";
import { BearWorkspaceUsersQuery } from "./users";
import { BearWorkspaceDateFilterConfigsQuery } from "./dateFilterConfigs";
import { BearWorkspaceAttributes } from "./attributes/index";
import { BearWorkspaceFacts } from "./facts";
import { userLoginMd5FromAuthenticatedPrincipal } from "../../utils/api";
import { BearWorkspaceUserGroupsQuery } from "./userGroups";
import { BearWorkspaceAccessControlService } from "./accessControl";

export class BearWorkspace implements IAnalyticalWorkspace {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly descriptor?: IWorkspaceDescriptor,
    ) {}

    public async getDescriptor(): Promise<IWorkspaceDescriptor> {
        if (!this.descriptor) {
            const projects = await this.authCall(async (sdk, { getPrincipal }) => {
                const userId = await userLoginMd5FromAuthenticatedPrincipal(getPrincipal);
                // TODO: this is wasteful; we should get single project directly
                return sdk.project.getProjects(userId);
            });
            const project = projects.find(
                (project) => project.links?.self.split("/").pop() === this.workspace,
            );
            return {
                id: this.workspace,
                description: project?.meta.summary ?? "",
                title: project?.meta.title ?? "",
                // isDemo:  TO-DO: Implement this using sdk.project.getProjectsWithPaging, which contains demoWorkspace prop
            };
        }

        return this.descriptor;
    }

    public async getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
        // Bear has no workspace parenting
        return undefined;
    }

    public attributes(): IWorkspaceAttributesService {
        return new BearWorkspaceAttributes(this.authCall, this.workspace);
    }

    public execution(): IExecutionFactory {
        return new BearExecution(this.authCall, this.workspace);
    }

    public settings(): IWorkspaceSettingsService {
        return new BearWorkspaceSettings(this.authCall, this.workspace);
    }

    public insights(): IWorkspaceInsightsService {
        return new BearWorkspaceInsights(this.authCall, this.workspace);
    }

    public dashboards(): IWorkspaceDashboardsService {
        return new BearWorkspaceDashboards(this.authCall, this.workspace);
    }

    public measures(): IWorkspaceMeasuresService {
        return new BearWorkspaceMeasures(this.authCall, this.workspace);
    }

    public facts(): IWorkspaceFactsService {
        return new BearWorkspaceFacts(this.authCall, this.workspace);
    }

    public styling(): IWorkspaceStylingService {
        return new BearWorkspaceStyling(this.authCall, this.workspace);
    }

    public catalog(): IWorkspaceCatalogFactory {
        return new BearWorkspaceCatalogFactory(this.authCall, this.workspace);
    }

    public datasets(): IWorkspaceDatasetsService {
        return new BearWorkspaceDataSets(this.authCall, this.workspace);
    }

    public permissions(): IWorkspacePermissionsService {
        return new BearWorkspacePermissionsFactory(this.authCall, this.workspace);
    }

    public users(): IWorkspaceUsersQuery {
        return new BearWorkspaceUsersQuery(this.authCall, this.workspace);
    }

    public dateFilterConfigs(): IDateFilterConfigsQuery {
        return new BearWorkspaceDateFilterConfigsQuery(this.authCall, this.workspace);
    }

    public userGroups(): IWorkspaceUserGroupsQuery {
        return new BearWorkspaceUserGroupsQuery(this.authCall, this.workspace);
    }

    public accessControl(): IWorkspaceAccessControlService {
        return new BearWorkspaceAccessControlService(this.authCall, this.workspace);
    }
}
