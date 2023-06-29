// (C) 2019-2023 GoodData Corporation

import {
    IAnalyticalBackendConfig,
    IAuthenticatedPrincipal,
    IBackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IExecutionFactory,
    IUserService,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspaceInsightsService,
    IWorkspaceAttributesService,
    IWorkspaceFactsService,
    IWorkspaceMeasuresService,
    IWorkspacePermissionsService,
    IWorkspacesQueryFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceDashboardsService,
    IWorkspaceUsersQuery,
    IDateFilterConfigsQuery,
    IWorkspaceDescriptor,
    IOrganization,
    ISecuritySettingsService,
    IOrganizations,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
    IOrganizationStylingService,
    IOrganizationSettingsService,
    IEntitlements,
} from "@gooddata/sdk-backend-spi";
import { IOrganizationDescriptor } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";

class BackendWithDecoratedServices implements IAnalyticalBackend {
    public capabilities: IBackendCapabilities;
    public config: IAnalyticalBackendConfig;
    private decorated: IAnalyticalBackend;
    private readonly factories: DecoratorFactories;

    constructor(backend: IAnalyticalBackend, factories: DecoratorFactories = {}) {
        this.decorated = backend;
        this.factories = factories;
        this.capabilities = backend.capabilities;
        this.config = backend.config;
    }

    public authenticate(force?: boolean): Promise<IAuthenticatedPrincipal> {
        return this.decorated.authenticate(force);
    }

    public deauthenticate(): Promise<void> {
        return this.decorated.deauthenticate();
    }

    public isAuthenticated(): Promise<IAuthenticatedPrincipal | null> {
        return this.decorated.isAuthenticated();
    }

    public onHostname(hostname: string): IAnalyticalBackend {
        return new BackendWithDecoratedServices(this.decorated.onHostname(hostname), this.factories);
    }

    public withAuthentication(provider: IAuthenticationProvider): IAnalyticalBackend {
        return new BackendWithDecoratedServices(this.decorated.withAuthentication(provider), this.factories);
    }

    public withTelemetry(componentName: string, props: object): IAnalyticalBackend {
        return new BackendWithDecoratedServices(
            this.decorated.withTelemetry(componentName, props),
            this.factories,
        );
    }

    public organization(organizationId: string): IOrganization {
        return new OrganizationDecorator(this.decorated.organization(organizationId), this.factories);
    }

    public organizations(): IOrganizations {
        return new OrganizationsDecorator(this.decorated.organizations(), this.factories);
    }

    public currentUser(): IUserService {
        return this.decorated.currentUser();
    }

    public workspace(id: string): IAnalyticalWorkspace {
        return new AnalyticalWorkspaceDecorator(this.decorated.workspace(id), this.factories);
    }

    public entitlements(): IEntitlements {
        return this.decorated.entitlements();
    }

    public workspaces(): IWorkspacesQueryFactory {
        return this.decorated.workspaces();
    }
}

class AnalyticalWorkspaceDecorator implements IAnalyticalWorkspace {
    public workspace: string;
    private decorated: IAnalyticalWorkspace;
    private readonly factories: DecoratorFactories;

    constructor(decorated: IAnalyticalWorkspace, factories: DecoratorFactories) {
        this.decorated = decorated;
        this.factories = factories;
        this.workspace = decorated.workspace;
    }

    public getDescriptor(): Promise<IWorkspaceDescriptor> {
        return this.decorated.getDescriptor();
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
}

class OrganizationDecorator implements IOrganization {
    readonly organizationId: string;
    private decorated: IOrganization;
    private readonly factories: DecoratorFactories;

    constructor(decorated: IOrganization, factories: DecoratorFactories) {
        this.decorated = decorated;
        this.factories = factories;
        this.organizationId = decorated.organizationId;
    }

    public getDescriptor(): Promise<IOrganizationDescriptor> {
        return this.decorated.getDescriptor();
    }

    public securitySettings(): ISecuritySettingsService {
        const { securitySettings } = this.factories;

        if (securitySettings) {
            return securitySettings(this.decorated.securitySettings());
        }

        return this.decorated.securitySettings();
    }

    public styling(): IOrganizationStylingService {
        return this.decorated.styling();
    }

    public settings(): IOrganizationSettingsService {
        return this.decorated.settings();
    }
}

class OrganizationsDecorator implements IOrganizations {
    constructor(private readonly decorated: IOrganizations, private readonly factories: DecoratorFactories) {}

    public async getCurrentOrganization(): Promise<IOrganization> {
        const fromDecorated = await this.decorated.getCurrentOrganization();
        return new OrganizationDecorator(fromDecorated, this.factories);
    }
}

/**
 * @alpha
 */
export type ExecutionDecoratorFactory = (executionFactory: IExecutionFactory) => IExecutionFactory;

/**
 * @alpha
 */
export type CatalogDecoratorFactory = (catalog: IWorkspaceCatalogFactory) => IWorkspaceCatalogFactory;

/**
 * @alpha
 */
export type SecuritySettingsDecoratorFactory = (
    securitySettings: ISecuritySettingsService,
) => ISecuritySettingsService;

/**
 * @alpha
 */
export type WorkspaceSettingsDecoratorFactory = (
    settings: IWorkspaceSettingsService,
    workspace: string,
) => IWorkspaceSettingsService;

/**
 * @alpha
 */
export type AttributesDecoratorFactory = (
    attributes: IWorkspaceAttributesService,
    workspace: string,
) => IWorkspaceAttributesService;

/**
 * @alpha
 */
export type DashboardsDecoratorFactory = (
    dashboards: IWorkspaceDashboardsService,
    workspace: string,
) => IWorkspaceDashboardsService;

/**
 * Provides factory functions for the different decorators (currently only supports execution
 * decorator). Input to each factory function is the original implementation from the wrapped backend, output
 * is whatever decorateur sees fit.
 *
 * @alpha
 */
export type DecoratorFactories = {
    execution?: ExecutionDecoratorFactory;
    catalog?: CatalogDecoratorFactory;
    securitySettings?: SecuritySettingsDecoratorFactory;
    workspaceSettings?: WorkspaceSettingsDecoratorFactory;
    attributes?: AttributesDecoratorFactory;
    dashboards?: DashboardsDecoratorFactory;
};

/**
 * Decorated backend is a wrapper of any other backend implementations that can be used to enrich
 * functionality of the services that the wrapped backend normally provides.
 *
 * It can be for instance used to decorate execution factories and in conjunction with {@link DecoratedPreparedExecution}
 * also create decorated prepared executions.
 *
 * @param backend - instance of backend to decorate
 * @param decorators - configuration for the decorations
 * @returns new decorated backend
 * @alpha
 */
export function decoratedBackend(
    backend: IAnalyticalBackend,
    decorators: DecoratorFactories,
): IAnalyticalBackend {
    if (isEmpty(decorators)) {
        return backend;
    }

    return new BackendWithDecoratedServices(backend, decorators);
}
