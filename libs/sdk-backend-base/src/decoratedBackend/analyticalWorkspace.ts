// (C) 2023-2024 GoodData Corporation
import {
    IAnalyticalWorkspace,
    IExecutionFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspaceInsightsService,
    IWorkspaceAttributesService,
    IWorkspaceFactsService,
    IWorkspaceMeasuresService,
    IWorkspacePermissionsService,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceDashboardsService,
    IWorkspaceUsersQuery,
    IDateFilterConfigsQuery,
    IWorkspaceDescriptor,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
    IAttributeHierarchiesService,
    IWorkspaceExportDefinitionsService,
    IDataFiltersService,
    IWorkspaceDescriptorUpdate,
    IWorkspaceLogicalModelService,
    IWorkspaceAutomationService,
} from "@gooddata/sdk-backend-spi";
import { DecoratorFactories } from "./types.js";

export class AnalyticalWorkspaceDecorator implements IAnalyticalWorkspace {
    public workspace: string;
    private decorated: IAnalyticalWorkspace;
    private readonly factories: DecoratorFactories;

    constructor(decorated: IAnalyticalWorkspace, factories: DecoratorFactories) {
        this.decorated = decorated;
        this.factories = factories;
        this.workspace = decorated.workspace;
    }

    public getDescriptor(includeParentPrefixes?: boolean): Promise<IWorkspaceDescriptor> {
        return this.decorated.getDescriptor(includeParentPrefixes);
    }

    public updateDescriptor(descriptor: IWorkspaceDescriptorUpdate): Promise<void> {
        return this.decorated.updateDescriptor(descriptor);
    }

    public getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
        return this.decorated.getParentWorkspace();
    }

    public attributes(): IWorkspaceAttributesService {
        const { attributes } = this.factories;

        if (attributes) {
            return attributes(this.decorated.attributes(), this.workspace);
        }

        return this.decorated.attributes();
    }

    public execution(): IExecutionFactory {
        const { execution } = this.factories;

        if (execution) {
            return execution(this.decorated.execution());
        }

        return this.decorated.execution();
    }

    public catalog(): IWorkspaceCatalogFactory {
        const { catalog } = this.factories;

        if (catalog) {
            return catalog(this.decorated.catalog());
        }

        return this.decorated.catalog();
    }

    public measures(): IWorkspaceMeasuresService {
        return this.decorated.measures();
    }

    public facts(): IWorkspaceFactsService {
        return this.decorated.facts();
    }

    public insights(): IWorkspaceInsightsService {
        return this.decorated.insights();
    }

    public dashboards(): IWorkspaceDashboardsService {
        const { dashboards } = this.factories;

        if (dashboards) {
            return dashboards(this.decorated.dashboards(), this.workspace);
        }

        return this.decorated.dashboards();
    }

    public settings(): IWorkspaceSettingsService {
        const { workspaceSettings } = this.factories;

        if (workspaceSettings) {
            return workspaceSettings(this.decorated.settings(), this.workspace);
        }

        return this.decorated.settings();
    }

    public styling(): IWorkspaceStylingService {
        return this.decorated.styling();
    }

    public datasets(): IWorkspaceDatasetsService {
        return this.decorated.datasets();
    }

    public permissions(): IWorkspacePermissionsService {
        return this.decorated.permissions();
    }

    public users(): IWorkspaceUsersQuery {
        return this.decorated.users();
    }

    public dateFilterConfigs(): IDateFilterConfigsQuery {
        return this.decorated.dateFilterConfigs();
    }

    public userGroups(): IWorkspaceUserGroupsQuery {
        return this.decorated.userGroups();
    }

    public accessControl(): IWorkspaceAccessControlService {
        return this.decorated.accessControl();
    }

    public attributeHierarchies(): IAttributeHierarchiesService {
        return this.decorated.attributeHierarchies();
    }

    public exportDefinitions(): IWorkspaceExportDefinitionsService {
        return this.decorated.exportDefinitions();
    }

    public dataFilters(): IDataFiltersService {
        return this.decorated.dataFilters();
    }

    public logicalModel(): IWorkspaceLogicalModelService {
        return this.decorated.logicalModel();
    }

    public automations(): IWorkspaceAutomationService {
        return this.decorated.automations();
    }
}
