// (C) 2019 GoodData Corporation

import {
    AnalyticalBackendConfig,
    AuthenticatedPrincipal,
    BackendCapabilities,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IElementQueryFactory,
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    IWorkspaceMetadata,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
} from "@gooddata/sdk-backend-spi";
import { DimensionGenerator, IDimension, IExecutionDefinition, SortItem } from "@gooddata/sdk-model";

import isEmpty = require("lodash/isEmpty");

/**
 * Provides factory functions for the different service decorators (currently only supports execution
 * decorator). Input to each factory function is the original implementation from the wrapped backend, output
 * is whatever decorateur sees fit.
 *
 * @internal
 */
export type ServiceDecoratorFactories = {
    execution?: (execution: IExecutionFactory) => IExecutionFactory;
};

class BackendWithDecoratedServices implements IAnalyticalBackend {
    public capabilities: BackendCapabilities;
    public config: AnalyticalBackendConfig;
    private decorated: IAnalyticalBackend;
    private readonly factories: ServiceDecoratorFactories;

    constructor(backend: IAnalyticalBackend, factories: ServiceDecoratorFactories = {}) {
        this.decorated = backend;
        this.factories = factories;
        this.capabilities = backend.capabilities;
        this.config = backend.config;
    }

    public authenticate(force?: boolean): Promise<AuthenticatedPrincipal> {
        return this.decorated.authenticate(force);
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

    public workspace(id: string): IAnalyticalWorkspace {
        return new AnalyticalWorkspaceDecorator(this.decorated.workspace(id), this.factories);
    }
}

class AnalyticalWorkspaceDecorator implements IAnalyticalWorkspace {
    public workspace: string;
    private decorated: IAnalyticalWorkspace;
    private readonly factories: ServiceDecoratorFactories;

    constructor(decorated: IAnalyticalWorkspace, factories: ServiceDecoratorFactories) {
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

    public metadata(): IWorkspaceMetadata {
        return this.decorated.metadata();
    }

    public settings(): IWorkspaceSettingsService {
        return this.decorated.settings();
    }

    public styling(): IWorkspaceStylingService {
        return this.decorated.styling();
    }
}

/**
 * Superclass for prepared execution decorators.
 *
 * @internal
 */
export abstract class DecoratedPreparedExecution implements IPreparedExecution {
    public readonly definition: IExecutionDefinition;

    protected constructor(private readonly decorated: IPreparedExecution) {
        this.definition = decorated.definition;
    }

    public equals(other: IPreparedExecution): boolean {
        return this.decorated.equals(other);
    }

    public execute(): Promise<IExecutionResult> {
        return this.decorated.execute();
    }

    public fingerprint(): string {
        return this.decorated.fingerprint();
    }

    public withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return this.createNew(this.decorated.withDimensions(...dim));
    }

    public withSorting(...items: SortItem[]): IPreparedExecution {
        return this.createNew(this.decorated.withSorting(...items));
    }

    /**
     * Methods that create new instances of prepared executions (withDimensions, withSorting) will
     * call out to this method to create decorated execution.
     *
     * @param decorated - instance to decorate
     */
    protected abstract createNew(decorated: IPreparedExecution): IPreparedExecution;
}

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
 * @internal
 */
export function decoratedBackend(backend: IAnalyticalBackend, decorators: ServiceDecoratorFactories) {
    if (isEmpty(decorators)) {
        return backend;
    }

    return new BackendWithDecoratedServices(backend, decorators);
}
