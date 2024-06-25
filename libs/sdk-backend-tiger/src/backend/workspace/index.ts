// (C) 2019-2024 GoodData Corporation

import {
    IAnalyticalWorkspace,
    IExecutionFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceCatalogFactory,
    IWorkspacePermissionsService,
    IWorkspaceInsightsService,
    IWorkspaceDatasetsService,
    IWorkspaceDashboardsService,
    NotSupported,
    IWorkspaceUsersQuery,
    IDateFilterConfigsQuery,
    IWorkspaceAttributesService,
    IWorkspaceMeasuresService,
    IWorkspaceFactsService,
    IWorkspaceDescriptor,
    IWorkspaceDescriptorUpdate,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
    IAttributeHierarchiesService,
    IWorkspaceExportDefinitionsService,
    IDataFiltersService,
    IWorkspaceLogicalModelService,
    IWorkspaceAutomationService,
} from "@gooddata/sdk-backend-spi";
import { TigerExecution } from "./execution/executionFactory.js";
import { TigerWorkspaceCatalogFactory } from "./catalog/factory.js";
import { TigerWorkspaceDataSets } from "./datasets/index.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { TigerWorkspaceAttributes } from "./attributes/index.js";
import { TigerWorkspaceSettings } from "./settings/index.js";
import { TigerWorkspacePermissionsFactory } from "./permissions/index.js";
import { TigerWorkspaceStyling } from "./styling/index.js";
import { TigerWorkspaceInsights } from "./insights/index.js";
import { TigerWorkspaceDashboards } from "./dashboards/index.js";
import { DateFormatter } from "../../convertors/fromBackend/dateFormatting/types.js";
import { workspaceConverter } from "../../convertors/fromBackend/WorkspaceConverter.js";
import { TigerWorkspaceMeasures } from "./measures/index.js";
import { TigerWorkspaceFacts } from "./facts/index.js";
import { TigerWorkspaceDateFilterConfigsQuery } from "./dateFilterConfigs/index.js";
import { TigerWorkspaceAccessControlService } from "./accessControl/index.js";
import { TigerAttributeHierarchiesService } from "./attributeHierarchies/index.js";
import { GET_OPTIMIZED_WORKSPACE_PARAMS } from "./constants.js";
import { TigerWorkspaceExportDefinitions } from "./exportDefinitions/index.js";
import { convertWorkspaceUpdate } from "../../convertors/toBackend/WorkspaceConverter.js";
import { TigerDataFiltersService } from "./dataFilters/index.js";
import { TigerWorkspaceLogicalModelService } from "./ldm/index.js";
import { TigerWorkspaceAutomationService } from "./automations/index.js";

export class TigerWorkspace implements IAnalyticalWorkspace {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly dateFormatter: DateFormatter,
        private readonly descriptor?: IWorkspaceDescriptor,
    ) {}

    public async getDescriptor(includeParentPrefixes: boolean = false): Promise<IWorkspaceDescriptor> {
        if (!this.descriptor) {
            return workspaceConverter(
                (
                    await this.authCall(async (client) => {
                        return client.entities.getEntityWorkspaces({
                            id: this.workspace,
                            ...GET_OPTIMIZED_WORKSPACE_PARAMS,
                        });
                    })
                ).data.data,
                includeParentPrefixes
                    ? (
                          await this.authCall(async (client) => {
                              return client.actions.inheritedEntityPrefixes({
                                  workspaceId: this.workspace,
                              });
                          })
                      ).data
                    : [],
            );
        }
        return this.descriptor;
    }

    public async updateDescriptor(descriptor: IWorkspaceDescriptorUpdate): Promise<void> {
        await this.authCall(async (client) => {
            return client.entities.patchEntityWorkspaces({
                id: this.workspace,
                jsonApiWorkspacePatchDocument: {
                    data: convertWorkspaceUpdate(descriptor, this.workspace),
                },
            });
        });
    }

    public async getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
        const descriptor = await this.getDescriptor();
        if (descriptor.parentWorkspace) {
            return new TigerWorkspace(this.authCall, descriptor.parentWorkspace, this.dateFormatter);
        }
        return undefined;
    }

    public attributes(): IWorkspaceAttributesService {
        return new TigerWorkspaceAttributes(this.authCall, this.workspace, this.dateFormatter);
    }

    public execution(): IExecutionFactory {
        return new TigerExecution(this.authCall, this.workspace, this.dateFormatter);
    }

    public settings(): IWorkspaceSettingsService {
        return new TigerWorkspaceSettings(this.authCall, this.workspace);
    }

    public insights(): IWorkspaceInsightsService {
        return new TigerWorkspaceInsights(this.authCall, this.workspace);
    }

    public dashboards(): IWorkspaceDashboardsService {
        return new TigerWorkspaceDashboards(this.authCall, this.workspace);
    }

    public measures(): IWorkspaceMeasuresService {
        return new TigerWorkspaceMeasures(this.authCall, this.workspace);
    }

    public facts(): IWorkspaceFactsService {
        return new TigerWorkspaceFacts(this.authCall, this.workspace);
    }

    public styling(): IWorkspaceStylingService {
        return new TigerWorkspaceStyling(this.authCall, this.workspace);
    }

    public catalog(): IWorkspaceCatalogFactory {
        return new TigerWorkspaceCatalogFactory(this.authCall, this.workspace);
    }

    public datasets(): IWorkspaceDatasetsService {
        return new TigerWorkspaceDataSets(this.authCall, this.workspace);
    }

    public permissions(): IWorkspacePermissionsService {
        return new TigerWorkspacePermissionsFactory(this.authCall, this.workspace);
    }

    public users(): IWorkspaceUsersQuery {
        throw new NotSupported("Not supported");
    }

    public userGroups(): IWorkspaceUserGroupsQuery {
        throw new NotSupported("Not supported");
    }

    public accessControl(): IWorkspaceAccessControlService {
        return new TigerWorkspaceAccessControlService(this.authCall, this.workspace);
    }

    public dateFilterConfigs(): IDateFilterConfigsQuery {
        return new TigerWorkspaceDateFilterConfigsQuery();
    }

    public attributeHierarchies(): IAttributeHierarchiesService {
        return new TigerAttributeHierarchiesService(this.authCall, this.workspace);
    }

    public exportDefinitions(): IWorkspaceExportDefinitionsService {
        return new TigerWorkspaceExportDefinitions(this.authCall, this.workspace);
    }

    public dataFilters(): IDataFiltersService {
        return new TigerDataFiltersService(this.authCall, this.workspace);
    }

    public logicalModel(): IWorkspaceLogicalModelService {
        return new TigerWorkspaceLogicalModelService(this.authCall, this.workspace);
    }

    public automations(): IWorkspaceAutomationService {
        return new TigerWorkspaceAutomationService(this.authCall, this.workspace);
    }
}
