// (C) 2019-2020 GoodData Corporation

import {
    AnalyticalBackendConfig,
    AuthenticatedPrincipal,
    BackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IElementQueryFactory,
    IExecutionFactory,
    IUserService,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspaceInsights,
    IWorkspaceMetadata,
    IWorkspacePermissionsFactory,
    IWorkspaceQueryFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceDashboards,
    IWorkspaceUsersQuery,
    IWorkspaceDateFilterConfigsQuery,
} from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";

class BackendWithDecoratedServices implements IAnalyticalBackend {
    public capabilities: BackendCapabilities;
    public config: AnalyticalBackendConfig;
    private decorated: IAnalyticalBackend;
    private readonly factories: DecoratorFactories;

    constructor(backend: IAnalyticalBackend, factories: DecoratorFactories = {}) {
        this.decorated = backend;
        this.factories = factories;
        this.capabilities = backend.capabilities;
        this.config = backend.config;
    }

    public authenticate(force?: boolean): Promise<AuthenticatedPrincipal> {
        return this.decorated.authenticate(force);
    }

    public deauthenticate(): Promise<void> {
        return this.decorated.deauthenticate();
    }

    public isAuthenticated(): Promise<AuthenticatedPrincipal | null> {
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

    public currentUser(): IUserService {
        return this.decorated.currentUser();
    }

    public workspace(id: string): IAnalyticalWorkspace {
        return new AnalyticalWorkspaceDecorator(this.decorated.workspace(id), this.factories);
    }

    public workspaces(): IWorkspaceQueryFactory {
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

    public elements(): IElementQueryFactory {
        return this.decorated.elements();
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

    public metadata(): IWorkspaceMetadata {
        return this.decorated.metadata();
    }

    public insights(): IWorkspaceInsights {
        return this.decorated.insights();
    }

    public dashboards(): IWorkspaceDashboards {
        return this.decorated.dashboards();
    }

    public settings(): IWorkspaceSettingsService {
        return this.decorated.settings();
    }

    public styling(): IWorkspaceStylingService {
        return this.decorated.styling();
    }

    public dataSets(): IWorkspaceDatasetsService {
        return this.decorated.dataSets();
    }

    public permissions(): IWorkspacePermissionsFactory {
        return this.decorated.permissions();
    }

    public users(): IWorkspaceUsersQuery {
        return this.decorated.users();
    }

    public dateFilterConfigs(): IWorkspaceDateFilterConfigsQuery {
        return this.decorated.dateFilterConfigs();
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
 * Provides factory functions for the different decorators (currently only supports execution
 * decorator). Input to each factory function is the original implementation from the wrapped backend, output
 * is whatever decorateur sees fit.
 *
 * @alpha
 */
export type DecoratorFactories = {
    execution?: ExecutionDecoratorFactory;
    catalog?: CatalogDecoratorFactory;
};

/**
 * Decorated backend is a wrapper of any other backend implementations that can be used to enrich
 * functionality of the services that the wrapped backend normally provides.
 *
 * It can be for instance used to decorate execution factories and in conjuction with {@link DecoratedPreparedExecution}
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
