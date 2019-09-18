// (C) 2019 GoodData Corporation
import {
    DataViewFacade,
    defFingerprint,
    defWithDimensions,
    defWithSorts,
    DimensionGenerator,
    IAnalyticalBackend,
    IDataView,
    IExecutionDefinition,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    NotSupported,
    toDimensions,
    IAnalyticalWorkspace,
    IExecutionFactory,
    IElementQueryFactory,
    IFeatureFlagsQuery,
    IWorkspaceMetadata,
    IWorkspaceStyling,
    AnalyticalBackendConfig,
    newDefFromBuckets,
    defWithFilters,
    newDefFromInsight,
    newDefFromItems,
} from "@gooddata/sdk-backend-spi";
import { IDimension, SortItem, IBucket, IFilter, AttributeOrMeasure, IInsight } from "@gooddata/sdk-model";

const nullPromise: Promise<null> = new Promise(r => r(null));
const noop: (..._: any[]) => Promise<null> = _ => nullPromise;
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
        withCredentials(username: string, _password: string): IAnalyticalBackend {
            return dummyBackend({ ...config, username });
        },
        workspace(id: string): IAnalyticalWorkspace {
            return dummyWorkspace(id);
        },
        isAuthenticated(): Promise<boolean> {
            return new Promise(r => r(true));
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
        forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(defWithFilters(newDefFromItems(workspace, items), filters));
        },
        forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(defWithFilters(newDefFromBuckets(workspace, buckets), filters));
        },
        forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
            return dummyPreparedExecution(defWithFilters(newDefFromInsight(workspace, insight), filters));
        },
        forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
            throw new NotSupported("not yet supported");
        },
    };
}

function dummyDataView(definition: IExecutionDefinition, result?: IExecutionResult): IDataView {
    const execResult = result ? result : dummyExecutionResult(definition);

    const fp = defFingerprint(definition) + "/emptyView";

    return {
        definition,
        result: execResult,
        headerItems: [[[]]],
        data: [[]],
        offset: [0, 0],
        count: [0, 0],
        advance: noop,
        pageDown: noop,
        pageUp: noop,
        pageLeft: noop,
        pageRight: noop,
        fingerprint(): string {
            return fp;
        },
        equals(other: IDataView): boolean {
            return fp === other.fingerprint();
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
            return dummyPreparedExecution(defWithDimensions(definition, toDimensions(dim, definition)));
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return dummyPreparedExecution(defWithSorts(definition, items));
        },
        execute(): Promise<IExecutionResult> {
            return new Promise(_ => dummyExecutionResult(definition));
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}
