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
    IFeatureFlagsQuery,
    IPreparedExecution,
    IWorkspaceMetadata,
    IWorkspaceStyling,
    NotSupported,
    AuthenticatedPrincipal,
} from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
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

const defaultConfig = { hostname: "test", username: "testUser@example.com" };

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
export function dummyBackend(config: AnalyticalBackendConfig = defaultConfig): IAnalyticalBackend {
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
            return dummyWorkspace(id);
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
 * @returns new instance of data view
 * @internal
 */
export function dummyDataView(definition: IExecutionDefinition, result?: IExecutionResult): IDataView {
    const execResult = result ? result : dummyExecutionResult(definition);

    const fp = defFingerprint(definition) + "/emptyView";

    return {
        definition,
        result: execResult,
        headerItems: [],
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

function dummyWorkspace(workspace: string): IAnalyticalWorkspace {
    return {
        workspace,
        execution(): IExecutionFactory {
            return dummyExecutionFactory(workspace);
        },
        elements(): IElementQueryFactory {
            throw new NotSupported("not supported");
        },
        featureFlags(): IFeatureFlagsQuery {
            throw new NotSupported("not supported");
        },
        metadata(): IWorkspaceMetadata {
            throw new NotSupported("not supported");
        },
        styling(): IWorkspaceStyling {
            throw new NotSupported("not supported");
        },
    };
}

function dummyExecutionFactory(workspace: string): IExecutionFactory {
    return {
        forDefinition(def: IExecutionDefinition): IPreparedExecution {
            return dummyPreparedExecution(def);
        },
        forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(newDefForItems(workspace, items, filters));
        },
        forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(newDefForBuckets(workspace, buckets, filters));
        },
        forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(newDefForInsight(workspace, insight, filters));
        },
        forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
            throw new NotSupported("not yet supported");
        },
    };
}

function dummyExecutionResult(definition: IExecutionDefinition): IExecutionResult {
    const fp = defFingerprint(definition) + "/emptyResult";
    const result: IExecutionResult = {
        definition,
        dimensions: [],
        readAll(): Promise<IDataView> {
            return new Promise(r => r(dummyDataView(definition, result)));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return new Promise(r => r(dummyDataView(definition, result)));
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
            return dummyPreparedExecution(definition);
        },
    };

    return result;
}

function dummyPreparedExecution(definition: IExecutionDefinition): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return dummyPreparedExecution(defWithDimensions(definition, dim));
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return dummyPreparedExecution(defWithSorting(definition, items));
        },
        execute(): Promise<IExecutionResult> {
            return new Promise(r => r(dummyExecutionResult(definition)));
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}
