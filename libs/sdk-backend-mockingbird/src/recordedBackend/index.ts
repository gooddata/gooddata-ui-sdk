// (C) 2019 GoodData Corporation
import { Execution } from "@gooddata/gd-bear-model";
import {
    AnalyticalBackendConfig,
    DataViewFacade,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
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
} from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    IBucket,
    IDimension,
    IFilter,
    IInsight,
    SortItem,
    IExecutionDefinition,
    defFingerprint,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
} from "@gooddata/sdk-model";

const defaultConfig = { hostname: "test", username: "testUser@example.com" };

/**
 * Master Index is the input needed to initialize the recorded backend.
 * @internal
 */
export type RecordingIndex = {
    [workspace: string]: WorkspaceRecordings;
};

/**
 * Workspace-specific recordings
 *
 * @internal
 */
export type WorkspaceRecordings = {
    [fp: string]: ExecutionRecording;
};

/**
 * Each recording in the master index has these 3 entries
 *
 * @internal
 */
export type ExecutionRecording = {
    definition: IExecutionDefinition;
    response: any;
    result: any;
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
 * @param index - index with available recordings
 * @param config - optionally provide configuration of the backend (host/user)
 * @internal
 */
export function recordedBackend(
    index: RecordingIndex,
    config: AnalyticalBackendConfig = defaultConfig,
): IAnalyticalBackend {
    const noopBackend: IAnalyticalBackend = {
        capabilities: {},
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return recordedBackend(index, { ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return noopBackend;
        },
        withCredentials(username: string, _password: string): IAnalyticalBackend {
            return recordedBackend(index, { ...config, username });
        },
        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id, index[id]);
        },
        isAuthenticated(): Promise<boolean> {
            return new Promise(r => r(true));
        },
    };

    return noopBackend;
}

/**
 * Creates a new data view facade for the provided recording.
 *
 * @param recording - recorded definition, AFM response and AFM result
 * @internal
 */
export function recordedDataFacade(recording: ExecutionRecording): DataViewFacade {
    const definition = recording.definition;

    // this result can readAll() and promise data view from recorded afm result
    const result = recordedExecutionResult(definition, recording);
    // the facade needs the data view right now, no promises; so create that too
    const dataView = recordedDataView(definition, result, recording);

    return new DataViewFacade(dataView);
}

//
// Internals
//

function recordedWorkspace(workspace: string, recordings: WorkspaceRecordings = {}): IAnalyticalWorkspace {
    return {
        workspace,
        execution(): IExecutionFactory {
            return recordedExecutionFactory(workspace, recordings);
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

function recordedExecutionFactory(
    workspace: string,
    recordings: WorkspaceRecordings = {},
): IExecutionFactory {
    return {
        forDefinition(def: IExecutionDefinition): IPreparedExecution {
            return recordedPreparedExecution(def, recordings);
        },
        forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
            return recordedPreparedExecution(newDefForItems(workspace, items, filters), recordings);
        },
        forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
            return recordedPreparedExecution(newDefForBuckets(workspace, buckets, filters), recordings);
        },
        forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
            return recordedPreparedExecution(newDefForInsight(workspace, insight, filters), recordings);
        },
        forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
            throw new NotSupported("not yet supported");
        },
    };
}

function recordedDataView(
    definition: IExecutionDefinition,
    result: IExecutionResult,
    recording: ExecutionRecording,
): IDataView {
    const afmResult = recording.result.executionResult as Execution.IExecutionResult;
    const fp = defFingerprint(definition) + "/recordedData";

    return {
        definition,
        result,
        headerItems: afmResult.headerItems ? afmResult.headerItems : [],
        data: afmResult.data,
        totals: afmResult.totals,
        offset: afmResult.paging.offset,
        count: afmResult.paging.count,
        totalCount: afmResult.paging.total,
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
    recording: ExecutionRecording,
): IExecutionResult {
    const fp = defFingerprint(definition) + "/recordedResult";
    const afmResponse = recording.response.executionResponse as Execution.IExecutionResponse;

    const result: IExecutionResult = {
        definition,
        dimensions: afmResponse.dimensions,
        readAll(): Promise<IDataView> {
            return new Promise(r => r(recordedDataView(definition, result, recording)));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return new Promise(r => r(recordedDataView(definition, result, recording)));
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

function recordedPreparedExecution(
    definition: IExecutionDefinition,
    recordings: WorkspaceRecordings = {},
): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return recordedPreparedExecution(defWithDimensions(definition, dim), recordings);
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return recordedPreparedExecution(defWithSorting(definition, items), recordings);
        },
        execute(): Promise<IExecutionResult> {
            return new Promise((resolve, reject) => {
                const recording = recordings["fp_" + fp];

                if (!recording) {
                    reject(new Error("Recording not found"));
                } else {
                    resolve(recordedExecutionResult(definition, recording));
                }
            });
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}
