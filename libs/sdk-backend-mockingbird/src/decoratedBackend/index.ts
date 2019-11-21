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
    IDimensionDescriptor,
    IExportResult,
    IExportConfig,
    IDataView,
    IWorkspaceCatalog,
} from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    DimensionGenerator,
    IBucket,
    IDimension,
    IExecutionDefinition,
    IFilter,
    IInsight,
    SortItem,
} from "@gooddata/sdk-model";

import isEmpty = require("lodash/isEmpty");

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

    public metadata(): IWorkspaceMetadata {
        return this.decorated.metadata();
    }

    public settings(): IWorkspaceSettingsService {
        return this.decorated.settings();
    }

    public styling(): IWorkspaceStylingService {
        return this.decorated.styling();
    }

    public catalog(): IWorkspaceCatalog {
        return this.decorated.catalog();
    }
}

export type PreparedExecutionWrapper = (execution: IPreparedExecution) => IPreparedExecution;

/**
 * Base class for execution factory decorators. Implements all delegates.
 *
 * There is an opt-in functionality to decorate the prepared executions - which is a typical use case for
 * factory decorators.
 */
export class DecoratedExecutionFactory implements IExecutionFactory {
    constructor(
        private readonly decorated: IExecutionFactory,
        private readonly wrapper?: PreparedExecutionWrapper,
    ) {}

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return this.wrap(this.decorated.forDefinition(def));
    }

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        return this.wrap(this.decorated.forItems(items, filters));
    }

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        return this.wrap(this.decorated.forBuckets(buckets, filters));
    }

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        return this.wrap(this.decorated.forInsight(insight, filters));
    }

    public forInsightByRef(uri: string, filters?: IFilter[]): Promise<IPreparedExecution> {
        return this.decorated.forInsightByRef(uri, filters).then(this.wrap);
    }

    private wrap = (execution: IPreparedExecution) => {
        return this.wrapper ? this.wrapper(execution) : execution;
    };
}

/**
 * Abstract base class for prepared execution decorators. Implements delegates to decorated execution. Concrete
 * implementations can override just the functions they are interested in.
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
     * call out to this method to create decorated execution. This is essential to maintain the decoration
     * during immutable operations where decorated implementation creates new instances.
     *
     * @param decorated - instance to decorate
     */
    protected abstract createNew(decorated: IPreparedExecution): IPreparedExecution;
}

/**
 * Abstract base class for execution result decorators. Implements delegates to decorated execution. Concrete
 * implementations can override just the functions they are interested in.
 *
 * The prepared execution wrap is needed here because of the transform function which normally creates new
 * instances of prepared execution - and so the decoration needs to be maintained.
 *
 * @internal
 */
export abstract class DecoratedExecutionResult implements IExecutionResult {
    public readonly definition: IExecutionDefinition;
    public readonly dimensions: IDimensionDescriptor[];

    constructor(
        private readonly decorated: IExecutionResult,
        private readonly wrapper: PreparedExecutionWrapper,
    ) {
        this.definition = decorated.definition;
        this.dimensions = decorated.dimensions;
    }

    public export(options: IExportConfig): Promise<IExportResult> {
        return this.decorated.export(options);
    }

    public readAll(): Promise<IDataView> {
        return this.decorated.readAll();
    }

    public readWindow(offset: number[], size: number[]): Promise<IDataView> {
        return this.decorated.readWindow(offset, size);
    }

    public transform(): IPreparedExecution {
        return this.wrapper(this.decorated.transform());
    }

    public equals(other: IExecutionResult): boolean {
        return this.decorated.equals(other);
    }

    public fingerprint(): string {
        return this.decorated.fingerprint();
    }
}

/**
 * Provides factory functions for the different decorators (currently only supports execution
 * decorator). Input to each factory function is the original implementation from the wrapped backend, output
 * is whatever decorateur sees fit.
 *
 * @internal
 */
export type DecoratorFactories = {
    execution?: (executionFactory: IExecutionFactory) => IExecutionFactory;
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
 * @internal
 */
export function decoratedBackend(backend: IAnalyticalBackend, decorators: DecoratorFactories) {
    if (isEmpty(decorators)) {
        return backend;
    }

    return new BackendWithDecoratedServices(backend, decorators);
}
