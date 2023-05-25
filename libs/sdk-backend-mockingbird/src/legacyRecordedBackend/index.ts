// (C) 2019-2023 GoodData Corporation
import { GdcExecution } from "@gooddata/api-model-bear";
import {
    IAnalyticalBackendConfig,
    IAuthenticatedPrincipal,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IDataView,
    IWorkspaceAttributesService,
    IWorkspaceMeasuresService,
    IWorkspaceFactsService,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IUserService,
    IWorkspaceCatalogFactory,
    IWorkspaceDashboardsService,
    IWorkspaceDatasetsService,
    IDateFilterConfigsQuery,
    IWorkspaceInsightsService,
    IWorkspacePermissionsService,
    IWorkspacesQueryFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceUsersQuery,
    NotSupported,
    IWorkspaceDescriptor,
    IOrganization,
    IOrganizations,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
    ExplainType,
    IExplainProvider,
    IEntitlements,
    IExportBlobResult,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    ISortItem,
    uriRef,
    defWithDateFormat,
    IExecutionConfig,
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    IDimensionDescriptor,
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
} from "@gooddata/sdk-model";
import { AbstractExecutionFactory } from "@gooddata/sdk-backend-base";
import isEqual from "lodash/isEqual.js";
import isEmpty from "lodash/isEmpty.js";
import isAttributeHeader = GdcExecution.isAttributeHeader;

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
    config: IAnalyticalBackendConfig = defaultConfig,
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
        organization(_organizationId: string): IOrganization {
            throw new NotSupported("not yet supported");
        },
        organizations(): IOrganizations {
            throw new NotSupported("not yet supported");
        },
        currentUser(): IUserService {
            throw new NotSupported("not yet supported");
        },
        workspace(id: string): IAnalyticalWorkspace {
            return recordedWorkspace(id, index[id]);
        },
        workspaces(): IWorkspacesQueryFactory {
            throw new NotSupported("not yet supported");
        },
        authenticate(): Promise<IAuthenticatedPrincipal> {
            return Promise.resolve({ userId: "recordedUser" });
        },
        deauthenticate(): Promise<void> {
            return Promise.resolve();
        },
        isAuthenticated(): Promise<IAuthenticatedPrincipal | null> {
            return Promise.resolve({ userId: "recordedUser" });
        },
        entitlements(): IEntitlements {
            throw new NotSupported("not yet supported");
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
        getDescriptor(): Promise<IWorkspaceDescriptor> {
            throw new NotSupported("not supported");
        },
        getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
            throw new NotSupported("not supported");
        },
        execution(): IExecutionFactory {
            return new RecordedExecutionFactory(recordings, workspace);
        },
        settings(): IWorkspaceSettingsService {
            throw new NotSupported("not supported");
        },
        attributes(): IWorkspaceAttributesService {
            throw new NotSupported("not supported");
        },
        measures(): IWorkspaceMeasuresService {
            throw new NotSupported("not supported");
        },
        facts(): IWorkspaceFactsService {
            throw new NotSupported("not supported");
        },
        insights(): IWorkspaceInsightsService {
            throw new NotSupported("not supported");
        },
        dashboards(): IWorkspaceDashboardsService {
            throw new NotSupported("not supported");
        },
        styling(): IWorkspaceStylingService {
            throw new NotSupported("not supported");
        },
        catalog(): IWorkspaceCatalogFactory {
            throw new NotSupported("not supported");
        },
        datasets(): IWorkspaceDatasetsService {
            throw new NotSupported("not supported");
        },
        permissions(): IWorkspacePermissionsService {
            throw new NotSupported("not supported");
        },
        users(): IWorkspaceUsersQuery {
            throw new NotSupported("not supported");
        },
        dateFilterConfigs(): IDateFilterConfigsQuery {
            throw new NotSupported("not supported");
        },

        userGroups(): IWorkspaceUserGroupsQuery {
            throw new NotSupported("not supported");
        },

        accessControl(): IWorkspaceAccessControlService {
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

function convertDimensions(dims: GdcExecution.IResultDimension[]): IDimensionDescriptor[] {
    return dims.map((dim) => {
        return {
            headers: dim.headers.map((header) => {
                if (isAttributeHeader(header)) {
                    return {
                        attributeHeader: {
                            ...header.attributeHeader,
                            ref: uriRef(header.attributeHeader.uri),
                            formOf: {
                                ...header.attributeHeader.formOf,
                                ref: uriRef(header.attributeHeader.formOf.uri),
                            },
                        },
                    } as IAttributeDescriptor;
                } else {
                    return {
                        measureGroupHeader: {
                            items: header.measureGroupHeader.items.map((measure) => {
                                return {
                                    measureHeaderItem: {
                                        ...measure.measureHeaderItem,
                                        ref: measure.measureHeaderItem.uri
                                            ? uriRef(measure.measureHeaderItem.uri)
                                            : undefined,
                                    },
                                };
                            }),
                            totalItems: header.measureGroupHeader.totalItems,
                        },
                    } as IMeasureGroupDescriptor;
                }
            }),
        };
    });
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
        dimensions: convertDimensions(afmResponse.dimensions),
        readAll(): Promise<IDataView> {
            return Promise.resolve(recordedDataView(definition, result, recording));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return Promise.resolve(recordedDataView(definition, result, recording));
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
        exportToBlob(_: IExportConfig): Promise<IExportBlobResult> {
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
        withDateFormat(dateFormat: string): IPreparedExecution {
            return executionFactory.forDefinition(defWithDateFormat(definition, dateFormat));
        },
        withExecConfig(config: IExecutionConfig): IPreparedExecution {
            if (!isEmpty(config?.dataSamplingPercentage)) {
                console.warn("Backend does not support data sampling, result will be not affected");
            }
            return executionFactory.forDefinition(definition);
        },
        execute(): Promise<IExecutionResult> {
            return new Promise((resolve, reject) => {
                const recording = recordings.execution?.["fp_" + fp];

                if (!recording) {
                    reject(new Error("Recording not found"));
                } else {
                    if (definition.postProcessing) {
                        recording.definition = {
                            ...recording.definition,
                            postProcessing: definition.postProcessing,
                        };
                    }
                    resolve(recordedExecutionResult(definition, executionFactory, recording));
                }
            });
        },
        explain<T extends ExplainType | undefined>(): IExplainProvider<T> {
            console.warn("Backend does not support explain mode");
            return {
                data: () => Promise.reject(new Error(`Backend does not support explain mode data call.`)),
                download: () => Promise.resolve(),
            };
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return isEqual(this.definition, other.definition);
        },
    };
}
