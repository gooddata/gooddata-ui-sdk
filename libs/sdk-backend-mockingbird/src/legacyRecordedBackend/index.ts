// (C) 2019 GoodData Corporation
import { Execution } from "@gooddata/gd-bear-model";
import {
    AnalyticalBackendConfig,
    AuthenticatedPrincipal,
    DataViewFacade,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IDataView,
    IElement,
    IElementQuery,
    IElementQueryFactory,
    IElementQueryOptions,
    IElementQueryResult,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IWorkspaceMetadata,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    defaultDimensionsGenerator,
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IAttributeDisplayForm,
    IBucket,
    IDimension,
    IExecutionDefinition,
    IFilter,
    IInsight,
    IVisualizationClass,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
    SortItem,
} from "@gooddata/sdk-model";

const defaultConfig = { hostname: "test", username: "testUser@example.com" };

/**
 * Master Index is the input needed to initialize the recorded backend.
 * @internal
 * @deprecated this implementation is deprecated, use non-legacy recorded backend
 */
export type RecordingIndex = {
    [workspace: string]: WorkspaceRecordings;
};

/**
 * Workspace-specific recordings
 *
 * @internal
 * @deprecated this implementation is deprecated, use non-legacy recorded backend
 */
export type WorkspaceRecordings = {
    execution?: {
        [fp: string]: LegacyExecutionRecording;
    };
    metadata?: {
        attributeDisplayForm?: { [id: string]: IAttributeDisplayForm };
    };
    elements?: {
        [id: string]: IElement[];
    };
};

/**
 * Each recording in the master index has these 3 entries
 *
 * @internal
 * @deprecated this implementation is deprecated, use non-legacy recorded backend
 */
export type LegacyExecutionRecording = {
    definition: IExecutionDefinition;
    response: any;
    result: any;
};

/**
 * This is legacy implementation of the recorded backend. Do not use for new tests.
 * @internal
 * @deprecated this implementation is deprecated, use non-legacy recorded backend
 */
export function legacyRecordedBackend(
    index: RecordingIndex,
    config: AnalyticalBackendConfig = defaultConfig,
): IAnalyticalBackend {
    const noopBackend: IAnalyticalBackend = {
        capabilities: {},
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return legacyRecordedBackend(index, { ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return noopBackend;
        },
        withAuthentication(_: IAuthenticationProvider): IAnalyticalBackend {
            return this;
        },

        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id, index[id]);
        },
        authenticate(): Promise<AuthenticatedPrincipal> {
            return Promise.resolve({ userId: "recordedUser" });
        },
        isAuthenticated(): Promise<AuthenticatedPrincipal | null> {
            return Promise.resolve({ userId: "recordedUser" });
        },
    };

    return noopBackend;
}

/**
 * Creates a new data view facade for the provided recording.
 *
 * This is legacy implementation of recorded backend. Do not use for new tests.
 *
 * @param recording - recorded definition, AFM response and AFM result
 * @internal
 * @deprecated this implementation is deprecated, use non-legacy recorded backend
 */
export function legacyRecordedDataFacade(recording: LegacyExecutionRecording): DataViewFacade {
    const definition = recording.definition;
    const executionFactory = recordedExecutionFactory(recording.definition.workspace);

    // this result can readAll() and promise data view from recorded afm result
    const result = recordedExecutionResult(definition, executionFactory, recording);
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
            return recordedElementsQueryFactory(recordings);
        },
        settings(): IWorkspaceSettingsService {
            throw new NotSupported("not supported");
        },
        metadata(): IWorkspaceMetadata {
            return recordedWorkspaceMetadata(recordings);
        },
        styling(): IWorkspaceStylingService {
            throw new NotSupported("not supported");
        },
    };
}

function recordedExecutionFactory(
    workspace: string,
    recordings: WorkspaceRecordings = {},
): IExecutionFactory {
    const factory: IExecutionFactory = {
        forDefinition(def: IExecutionDefinition): IPreparedExecution {
            return recordedPreparedExecution(def, factory, recordings);
        },
        forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
            const def = defWithDimensions(
                newDefForItems(workspace, items, filters),
                defaultDimensionsGenerator,
            );

            return factory.forDefinition(def);
        },
        forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
            const def = defWithDimensions(
                newDefForBuckets(workspace, buckets, filters),
                defaultDimensionsGenerator,
            );

            return factory.forDefinition(def);
        },
        forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
            const def = defWithDimensions(
                newDefForInsight(workspace, insight, filters),
                defaultDimensionsGenerator,
            );

            return factory.forDefinition(def);
        },
        forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
            throw new NotSupported("not yet supported");
        },
    };

    return factory;
}

function recordedDataView(
    definition: IExecutionDefinition,
    result: IExecutionResult,
    recording: LegacyExecutionRecording,
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
    executionFactory: IExecutionFactory,
    recording: LegacyExecutionRecording,
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
            return executionFactory.forDefinition(definition);
        },
    };

    return result;
}

function recordedPreparedExecution(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    recordings: WorkspaceRecordings = {},
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
            return new Promise((resolve, reject) => {
                const recording = recordings.execution && recordings.execution["fp_" + fp];

                if (!recording) {
                    reject(new Error("Recording not found"));
                } else {
                    resolve(recordedExecutionResult(definition, executionFactory, recording));
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

function recordedWorkspaceMetadata(recordings: WorkspaceRecordings = {}): IWorkspaceMetadata {
    return {
        getAttributeDisplayForm: async (id: string): Promise<IAttributeDisplayForm> => {
            const recording =
                recordings.metadata &&
                recordings.metadata.attributeDisplayForm &&
                recordings.metadata.attributeDisplayForm[id.replace(/\./g, "_")];

            if (!recording) {
                throw new Error("Recording not found");
            }

            return recording;
        },
        getInsight(_id: string): Promise<IInsight> {
            throw new NotSupported("not supported");
        },
        getVisualizationClass(_id: string): Promise<IVisualizationClass> {
            throw new NotSupported("not supported");
        },
        getVisualizationClasses(): Promise<IVisualizationClass[]> {
            throw new NotSupported("not supported");
        },
    };
}

function recordedElementsQueryFactory(recordings: WorkspaceRecordings = {}): IElementQueryFactory {
    return {
        forObject(objectId: string): IElementQuery {
            return recordedElementQuery(objectId, recordings);
        },
    };
}

function recordedElementQuery(objectId: string, recordings: WorkspaceRecordings = {}): IElementQuery {
    let _limit = 50;
    let _offset = 0;

    const queryWorker = async (offset: number, limit: number): Promise<IElementQueryResult> => {
        const recording = recordings.elements && recordings.elements[objectId.replace(/\./g, "_")];

        if (!recording) {
            throw new Error("Recording not found");
        }

        const slice = recording.slice(offset, offset + limit);

        const emptyResult: IElementQueryResult = {
            elements: [],
            limit,
            offset: recording.length,
            totalCount: recording.length,
            next: () => Promise.resolve(emptyResult),
        };

        const hasNextPage = offset + limit < recording.length;

        return {
            elements: slice,
            limit: Math.min(limit, slice.length),
            next() {
                return hasNextPage ? queryWorker(offset + limit, limit) : Promise.resolve(emptyResult);
            },
            offset: Math.min(offset, recording.length),
            totalCount: recording.length,
        };
    };

    return {
        query(): Promise<IElementQueryResult> {
            return queryWorker(_offset, _limit);
        },
        withLimit(limit: number): IElementQuery {
            _limit = limit;
            return this;
        },
        withOffset(offset: number): IElementQuery {
            _offset = offset;
            return this;
        },
        withOptions(_options: IElementQueryOptions): IElementQuery {
            // options are ignored for now
            return this;
        },
    };
}
