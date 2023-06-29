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
import { BearExecution } from "./execution/executionFactory.js";
import { BearWorkspaceMeasures } from "./measures/index.js";
import { BearWorkspaceStyling } from "./styling/styling.js";
import { BearWorkspaceCatalogFactory } from "./catalog/factory.js";
import { BearWorkspaceSettings } from "./settings/settings.js";
import { BearWorkspacePermissionsFactory } from "./permissions/permissions.js";
import { BearWorkspaceInsights } from "./insights/index.js";
import { BearWorkspaceDataSets } from "./datasets/index.js";
import { BearWorkspaceDashboards } from "./dashboards/index.js";
import { BearAuthenticatedCallGuard } from "../../types/auth.js";
import { BearWorkspaceUsersQuery } from "./users/index.js";
import { BearWorkspaceDateFilterConfigsQuery } from "./dateFilterConfigs/index.js";
import { BearWorkspaceAttributes } from "./attributes/index.js";
import { BearWorkspaceFacts } from "./facts/index.js";
import { BearWorkspaceUserGroupsQuery } from "./userGroups/index.js";
import { BearWorkspaceAccessControlService } from "./accessControl/index.js";

export class BearWorkspace implements IAnalyticalWorkspace {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly descriptor?: IWorkspaceDescriptor,
    ) {}

    public async getDescriptor(): Promise<IWorkspaceDescriptor> {
        if (!this.descriptor) {
            const project = await this.authCall(async (sdk) => {
                return sdk.project.getProject(this.workspace);
            });

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
