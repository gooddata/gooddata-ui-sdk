// (C) 2019-2020 GoodData Corporation
import { GdcExecution } from "@gooddata/api-model-bear";
import {
    AnalyticalBackendConfig,
    AuthenticatedPrincipal,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IDataView,
    IElementQueryFactory,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IUserService,
    IWorkspaceCatalogFactory,
    IWorkspaceDatasetsService,
    IWorkspaceInsights,
    IWorkspaceMetadata,
    IWorkspacePermissionsFactory,
    IWorkspaceQueryFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    NotSupported,
    IWorkspaceDashboards,
    IWorkspaceUsersQuery,
    IWorkspaceDateFilterConfigsQuery,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    IDimension,
    IExecutionDefinition,
    IFilter,
    ISortItem,
} from "@gooddata/sdk-model";
import { AbstractExecutionFactory } from "@gooddata/sdk-backend-base";

const defaultConfig = { hostname: "test" };

/**
 * Master Index is the input needed to initialize the recorded backend.
 * @internal
 * @deprecated this implementation is deprecated, use non-legacy recorded backend
 */
export type LegacyRecordingIndex = {
    [workspace: string]: LegacyWorkspaceRecordings;
};

/**
 * Workspace-specific recordings
 *
 * @internal
 * @deprecated this implementation is deprecated, use non-legacy recorded backend
 */
export type LegacyWorkspaceRecordings = {
    execution?: {
        [fp: string]: LegacyExecutionRecording;
    };
    metadata?: {
        attributeDisplayForm?: { [id: string]: IAttributeDisplayFormMetadataObject };
    };
    elements?: {
        [id: string]: IAttributeElement[];
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
    index: LegacyRecordingIndex,
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
        currentUser(): IUserService {
            throw new NotSupported("not yet supported");
        },
        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id, index[id]);
        },
        workspaces(): IWorkspaceQueryFactory {
            throw new NotSupported("not yet supported");
        },
        authenticate(): Promise<AuthenticatedPrincipal> {
            return Promise.resolve({ userId: "recordedUser" });
        },
        deauthenticate(): Promise<void> {
            return Promise.resolve();
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
export function legacyRecordedDataView(recording: LegacyExecutionRecording): IDataView {
    const definition = recording.definition;
    const executionFactory = new RecordedExecutionFactory({}, recording.definition.workspace);

    const result = recordedExecutionResult(definition, executionFactory, recording);
    return recordedDataView(definition, result, recording);
}

//
// Internals
//

function recordedWorkspace(
    workspace: string,
    recordings: LegacyWorkspaceRecordings = {},
): IAnalyticalWorkspace {
    return {
        workspace,
        execution(): IExecutionFactory {
            return new RecordedExecutionFactory(recordings, workspace);
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
        insights(): IWorkspaceInsights {
            throw new NotSupported("not supported");
        },
        dashboards(): IWorkspaceDashboards {
            throw new NotSupported("not supported");
        },
        styling(): IWorkspaceStylingService {
            throw new NotSupported("not supported");
        },
        catalog(): IWorkspaceCatalogFactory {
            throw new NotSupported("not supported");
        },
        dataSets(): IWorkspaceDatasetsService {
            throw new NotSupported("not supported");
        },
        permissions(): IWorkspacePermissionsFactory {
            throw new NotSupported("not supported");
        },
        users(): IWorkspaceUsersQuery {
            throw new NotSupported("not supported");
        },
        dateFilterConfigs(): IWorkspaceDateFilterConfigsQuery {
            throw new NotSupported("not supported");
        },
    };
}

class RecordedExecutionFactory extends AbstractExecutionFactory {
    constructor(private readonly recordings: LegacyWorkspaceRecordings, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return recordedPreparedExecution(def, this, this.recordings);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotSupported("not yet supported");
    }
}

function recordedDataView(
    definition: IExecutionDefinition,
    result: IExecutionResult,
    recording: LegacyExecutionRecording,
): IDataView {
    const afmResult = recording.result.executionResult as GdcExecution.IExecutionResult;
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
    const afmResponse = recording.response.executionResponse as GdcExecution.IExecutionResponse;

    const result: IExecutionResult = {
        definition,
        dimensions: afmResponse.dimensions,
        readAll(): Promise<IDataView> {
            return new Promise((r) => r(recordedDataView(definition, result, recording)));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return new Promise((r) => r(recordedDataView(definition, result, recording)));
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
    recordings: LegacyWorkspaceRecordings = {},
): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return executionFactory.forDefinition(defWithDimensions(definition, ...dim));
        },
        withSorting(...items: ISortItem[]): IPreparedExecution {
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
