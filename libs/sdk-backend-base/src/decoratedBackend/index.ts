// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type IAnalyticalBackend,
    type IAnalyticalBackendConfig,
    type IAnalyticalWorkspace,
    type IAuthenticatedPrincipal,
    type IAuthenticationProvider,
    type IBackendCapabilities,
    type IDataSourcesService,
    type IEntitlements,
    type IGeoService,
    type IOrganization,
    type IOrganizations,
    type IUserService,
    type IWorkspacesQueryFactory,
} from "@gooddata/sdk-backend-spi";

import { AnalyticalWorkspaceDecorator } from "./analyticalWorkspace.js";
import { OrganizationDecorator } from "./organization.js";
import { OrganizationsDecorator } from "./organizations.js";
import { type DecoratorFactories } from "./types.js";

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

    public deauthenticate(returnTo?: string): Promise<void> {
        return this.decorated.deauthenticate(returnTo);
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

    public withCorrelation(correlationMetadata: Record<string, string>): IAnalyticalBackend {
        return new BackendWithDecoratedServices(
            this.decorated.withCorrelation(correlationMetadata),
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

    public dataSources(): IDataSourcesService {
        return this.decorated.dataSources();
    }

    public workspaces(): IWorkspacesQueryFactory {
        return this.decorated.workspaces();
    }

    public geo(): IGeoService {
        const { geo } = this.factories;
        if (geo) {
            return geo(this.decorated.geo());
        }
        return this.decorated.geo();
    }
}

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
