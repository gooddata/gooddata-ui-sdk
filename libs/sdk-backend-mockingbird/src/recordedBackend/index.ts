// (C) 2019 GoodData Corporation
import {
    AnalyticalBackendConfig,
    DataViewFacade,
    defFingerprint,
    defForBuckets,
    defForInsight,
    defForItems,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IDataView,
    IElementQueryFactory,
    IExecutionDefinition,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IFeatureFlagsQuery,
    IPreparedExecution,
    IWorkspaceMetadata,
    IWorkspaceStyling,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IBucket, IDimension, IFilter, IInsight, SortItem } from "@gooddata/sdk-model";
import { Execution } from "@gooddata/gd-bear-model";

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
export function recordedBackend(config: AnalyticalBackendConfig = defaultConfig): IAnalyticalBackend {
    const noopBackend: IAnalyticalBackend = {
        capabilities: {},
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return recordedBackend({ ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return noopBackend;
        },
        withCredentials(username: string, _password: string): IAnalyticalBackend {
            return recordedBackend({ ...config, username });
        },
        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id);
        },
        isAuthenticated(): Promise<boolean> {
            return new Promise(r => r(true));
        },
    };

    return noopBackend;
}

/**
 * @internal
 */
export type ExecutionRecording = {
    definition: any;
    response: any;
    result: any;
};

/**
 * Creates a new, empty data view facade for the provided execution definition. The definition will be
 * retained as-is. The data will be empty.
 * @param recording - recorded definition, AFM response and AFM result
 * @internal
 */
export function recordedDataFacade(recording: ExecutionRecording): DataViewFacade {
    const definition = recording.definition as IExecutionDefinition;
    const afmResponse = recording.response.executionResponse as Execution.IExecutionResponse;
    const afmResult = recording.result.executionResult as Execution.IExecutionResult;

    // this result can readAll() and promise data view from recorded afm result
    const result = recordedExecutionResult(definition, afmResponse, afmResult);
    // the facade needs the data view right now, no promises; co create that too
    const dataView = recordedDataView(definition, result, afmResult);

    return new DataViewFacade(dataView);
}

//
// Internals
//

function recordedWorkspace(workspace: string): IAnalyticalWorkspace {
    return {
        workspace,
        execution(): IExecutionFactory {
            return recordedExecutionFactory(workspace);
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

function recordedExecutionFactory(workspace: string): IExecutionFactory {
    return {
        forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
            return recordedPreparedExecution(defForItems(workspace, items, filters));
        },
        forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
            return recordedPreparedExecution(defForBuckets(workspace, buckets, filters));
        },
        forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
            return recordedPreparedExecution(defForInsight(workspace, insight, filters));
        },
        forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
            throw new NotSupported("not yet supported");
        },
    };
}

function recordedDataView(
    definition: IExecutionDefinition,
    result: IExecutionResult,
    afmResult: Execution.IExecutionResult,
): IDataView {
    const fp = defFingerprint(definition) + "/recordedData";

    return {
        definition,
        result,
        headerItems: afmResult.headerItems ? afmResult.headerItems : [[[]]],
        data: afmResult.data ? afmResult.data : [[]],
        offset: afmResult.paging.offset,
        count: afmResult.paging.count,
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

function recordedExecutionResult(
    definition: IExecutionDefinition,
    afmResponse: Execution.IExecutionResponse,
    afmResult: Execution.IExecutionResult,
): IExecutionResult {
    const fp = defFingerprint(definition) + "/recordedResult";

    const result: IExecutionResult = {
        definition,
        dimensions: afmResponse.dimensions,
        readAll(): Promise<IDataView> {
            return new Promise(r => r(recordedDataView(definition, result, afmResult)));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return new Promise(r => r(recordedDataView(definition, result, afmResult)));
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
            return recordedPreparedExecution(definition);
        },
    };

    return result;
}

function recordedPreparedExecution(definition: IExecutionDefinition): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return recordedPreparedExecution(defWithDimensions(definition, dim));
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return recordedPreparedExecution(defWithSorting(definition, items));
        },
        execute(): Promise<IExecutionResult> {
            // TODO: this needs completion; the playlist should contain a generated fingerprint of execution definition,
            //  and all that this impl would do for execution is locate recording by the fingerprint.
            throw new NotSupported("...");
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}
