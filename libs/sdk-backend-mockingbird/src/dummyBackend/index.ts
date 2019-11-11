// (C) 2019 GoodData Corporation
import {
    AnalyticalBackendConfig,
    DataViewFacade,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IDataView,
    IElementQueryFactory,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IWorkspaceSettingsService,
    IPreparedExecution,
    IWorkspaceMetadata,
    IWorkspaceStylingService,
    NotSupported,
    AuthenticatedPrincipal,
    IResultHeader,
    NoDataError,
} from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    defaultDimensionsGenerator,
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IBucket,
    IDimension,
    IExecutionDefinition,
    IFilter,
    IInsight,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
    SortItem,
} from "@gooddata/sdk-model";

/**
 *
 */
export type DummyBackendConfig = AnalyticalBackendConfig & {
    /**
     * Influences whether readAll() / readWindow() should throw NoDataError() or return empty data view.
     *
     * The empty data view is returned by default - and can be used in tests that verify definition parts of
     * the returned data view.
     *
     * Throwing NoDataError is closer to how normal backends behave.
     */
    raiseNoDataExceptions: boolean;
};

/**
 *
 */
export const defaultDummyBackendConfig: DummyBackendConfig = {
    hostname: "test",
    raiseNoDataExceptions: false,
};

/**
 * Returns dummy backend - this backend focuses on the execution 'branch' of the SPI. it implements
 * execution factory et al. in a way, that the returned result and data view have a correct execution
 * definition but have no data whatsoever.
 *
 * This implementation is suitable when:
 * - testing code which builds and configures an instance of IPreparedExecution.
 * - testing code which works with IDataView's' execution definition
 *
 * @param config - optionally provide configuration of the backend (host/user)
 * @internal
 */
export function dummyBackend(config: DummyBackendConfig = defaultDummyBackendConfig): IAnalyticalBackend {
    const noopBackend: IAnalyticalBackend = {
        capabilities: {},
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return dummyBackend({ ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return noopBackend;
        },
        withAuthentication(_: IAuthenticationProvider): IAnalyticalBackend {
            return this;
        },
        workspace(id: string): IAnalyticalWorkspace {
            return dummyWorkspace(id, config);
        },
        authenticate(): Promise<AuthenticatedPrincipal> {
            return Promise.resolve({ userId: "dummyUser" });
        },

        isAuthenticated(): Promise<AuthenticatedPrincipal | null> {
            return Promise.resolve({ userId: "dummyUser" });
        },
    };

    return noopBackend;
}

/**
 * Creates a new, empty data view facade for the provided execution definition. The definition will be
 * retained as-is. The data will be empty.
 * @param definition - execution definition
 * @internal
 */
export function dummyDataFacade(definition: IExecutionDefinition): DataViewFacade {
    return new DataViewFacade(dummyDataView(definition));
}

/**
 * Creates a new, empty data view for the provided execution definition. The definition will be retained as-is, data
 * will be empty.
 *
 * @param definition - execution definition
 * @param result - optionally a result to link with the data view, if not provided an execution result will be
 *  created
 * @param config - optionally override config that will be passed to exec result that may be created for the
 *  data view (it is needed there in order to correctly handle readAll() and read()); config will not be used
 *  if the `result` parameter is provided explicitly
 * @returns new instance of data view
 * @internal
 */
export function dummyDataView(
    definition: IExecutionDefinition,
    result?: IExecutionResult,
    config: DummyBackendConfig = defaultDummyBackendConfig,
): IDataView {
    const factory = dummyExecutionFactory(definition.workspace, config);
    const execResult = result ? result : dummyExecutionResult(definition, factory, config);

    const fp = defFingerprint(definition) + "/emptyView";

    const emptyHeaders: IResultHeader[][][] = definition.dimensions.map(dim =>
        dim.itemIdentifiers.map(_ => []),
    );

    return {
        definition,
        result: execResult,
        headerItems: emptyHeaders,
        data: [],
        offset: [0, 0],
        count: [0, 0],
        totalCount: [0, 0],
        fingerprint(): string {
            return fp;
        },
        equals(other: IDataView): boolean {
            return fp === other.fingerprint();
        },
    };
}
//
// Internals
//

function dummyWorkspace(workspace: string, config: DummyBackendConfig): IAnalyticalWorkspace {
    return {
        workspace,
        execution(): IExecutionFactory {
            return dummyExecutionFactory(workspace, config);
        },
        elements(): IElementQueryFactory {
            throw new NotSupported("not supported");
        },
        settings(): IWorkspaceSettingsService {
            throw new NotSupported("not supported");
        },
        metadata(): IWorkspaceMetadata {
            throw new NotSupported("not supported");
        },
        styling(): IWorkspaceStylingService {
            throw new NotSupported("not supported");
        },
    };
}

function dummyExecutionFactory(workspace: string, config: DummyBackendConfig): IExecutionFactory {
    const factory: IExecutionFactory = {
        forDefinition(def: IExecutionDefinition): IPreparedExecution {
            return dummyPreparedExecution(def, factory, config);
        },
        forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(
                defWithDimensions(newDefForItems(workspace, items, filters), defaultDimensionsGenerator),
                factory,
                config,
            );
        },
        forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(
                defWithDimensions(newDefForBuckets(workspace, buckets, filters), defaultDimensionsGenerator),
                factory,
                config,
            );
        },
        forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(
                defWithDimensions(newDefForInsight(workspace, insight, filters), defaultDimensionsGenerator),
                factory,
                config,
            );
        },
        forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
            throw new NotSupported("not yet supported");
        },
    };

    return factory;
}

function dummyExecutionResult(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    config: DummyBackendConfig,
): IExecutionResult {
    const fp = defFingerprint(definition) + "/emptyResult";

    const result: IExecutionResult = {
        definition,
        dimensions: [],
        readAll(): Promise<IDataView> {
            if (config.raiseNoDataExceptions) {
                return Promise.reject(new NoDataError("Empty data view from dummy backend"));
            }

            return Promise.resolve(dummyDataView(definition, result, config));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            if (config.raiseNoDataExceptions) {
                return Promise.reject(new NoDataError("Empty data view from dummy backend"));
            }

            return Promise.resolve(dummyDataView(definition, result, config));
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IExecutionResult): boolean {
            return fp === other.fingerprint();
        },
        export(_: IExportConfig): Promise<IExportResult> {
            throw new NotSupported("...");
        },
        transform(): IPreparedExecution {
            return executionFactory.forDefinition(definition);
        },
    };

    return result;
}

function dummyPreparedExecution(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    config: DummyBackendConfig,
): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return executionFactory.forDefinition(defWithDimensions(definition, ...dim));
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return executionFactory.forDefinition(defWithSorting(definition, items));
        },
        execute(): Promise<IExecutionResult> {
            return new Promise(r => r(dummyExecutionResult(definition, executionFactory, config)));
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}
