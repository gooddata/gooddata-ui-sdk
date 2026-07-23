// (C) 2023-2026 GoodData Corporation

import {
    type IAnalyticalWorkspace,
    type IAttributeHierarchiesService,
    type IDataFiltersService,
    type IDateFilterConfigsQuery,
    type IExecutionFactory,
    type IGenAIService,
    type IReferencesService,
    type IWorkspaceAccessControlService,
    type IWorkspaceAgentsService,
    type IWorkspaceAttributesService,
    type IWorkspaceAutomationService,
    type IWorkspaceCatalogFactory,
    type IWorkspaceDashboardsService,
    type IWorkspaceDatasetsService,
    type IWorkspaceDescriptor,
    type IWorkspaceDescriptorUpdate,
    type IWorkspaceExportDefinitionsService,
    type IWorkspaceExportTemplatesService,
    type IWorkspaceFactsService,
    type IWorkspaceInsightsService,
    type IWorkspaceKeyDriverAnalysisService,
    type IWorkspaceLogicalModelService,
    type IWorkspaceMeasuresService,
    type IWorkspaceObjectPermissionsService,
    type IWorkspaceParametersService,
    type IWorkspacePermissionsService,
    type IWorkspaceSettingsService,
    type IWorkspaceStylingService,
    type IWorkspaceUserGroupsQuery,
    type IWorkspaceUsersQuery,
} from "@gooddata/sdk-backend-spi";

import { type DecoratorFactories } from "./types.js";

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

    public updateDescriptor(descriptor: IWorkspaceDescriptorUpdate): Promise<IWorkspaceDescriptor> {
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

    public keyDriverAnalysis(): IWorkspaceKeyDriverAnalysisService {
        return this.decorated.keyDriverAnalysis();
    }

    public measures(): IWorkspaceMeasuresService {
        const { measures } = this.factories;

        if (measures) {
            return measures(this.decorated.measures(), this.workspace);
        }

        return this.decorated.measures();
    }

    public parameters(): IWorkspaceParametersService {
        return this.decorated.parameters();
    }

    public facts(): IWorkspaceFactsService {
        const { facts } = this.factories;

        if (facts) {
            return facts(this.decorated.facts(), this.workspace);
        }

        return this.decorated.facts();
    }

    public insights(): IWorkspaceInsightsService {
        const { insights } = this.factories;

        if (insights) {
            return insights(this.decorated.insights(), this.workspace);
        }

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

    public objectPermissions(): IWorkspaceObjectPermissionsService {
        return this.decorated.objectPermissions();
    }

    public attributeHierarchies(): IAttributeHierarchiesService {
        return this.decorated.attributeHierarchies();
    }

    public agents(): IWorkspaceAgentsService {
        return this.decorated.agents();
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
        const { automations } = this.factories;

        if (automations) {
            return automations(this.decorated.automations(), this.workspace);
        }

        return this.decorated.automations();
    }

    public genAI(): IGenAIService {
        return this.decorated.genAI();
    }

    public references(): IReferencesService {
        return this.decorated.references();
    }

    public exportTemplates(): IWorkspaceExportTemplatesService {
        const { workspaceExportTemplates } = this.factories;

        if (workspaceExportTemplates) {
            return workspaceExportTemplates(this.decorated.exportTemplates(), this.workspace);
        }

        return this.decorated.exportTemplates();
    }
}
