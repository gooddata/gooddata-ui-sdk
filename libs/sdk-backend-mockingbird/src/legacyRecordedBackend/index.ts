// (C) 2019-2026 GoodData Corporation

import { isEmpty, isEqual } from "lodash-es";

import { AbstractExecutionFactory } from "@gooddata/sdk-backend-base";
import {
    type ExplainType,
    type IAnomalyDetectionResult,
    type IClusteringConfig,
    type IClusteringResult,
    type ICollectionItemsConfig,
    type ICollectionItemsResult,
    type IDataView,
    type IExecutionContext,
    type IExecutionFactory,
    type IExecutionResult,
    type IExplainProvider,
    type IExportConfig,
    type IExportResult,
    type IForecastResult,
    type IForecastView,
    type IOutliersConfig,
    type IOutliersResult,
    type IOutliersView,
    type IPreparedExecution,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    type DimensionGenerator,
    type IAttributeDescriptor,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IBucket,
    type IDimension,
    type IDimensionDescriptor,
    type IExecutionConfig,
    type IExecutionDefinition,
    type IMeasureGroupDescriptor,
    type ISortItem,
    defFingerprint,
    defWithBuckets,
    defWithDateFormat,
    defWithDimensions,
    defWithSorting,
    uriRef,
} from "@gooddata/sdk-model";

import {
    type IExecutionResponse,
    type IExecutionResult as ILegacyExecutionResult,
    type IResultDimension,
    isAttributeHeader,
} from "./legacyBackendTypes.js";

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

class RecordedExecutionFactory extends AbstractExecutionFactory {
    constructor(
        private readonly recordings: LegacyWorkspaceRecordings,
        workspace: string,
    ) {
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
    const afmResult = recording.result.executionResult as ILegacyExecutionResult;
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
        metadata: {
            dataSourceMessages: [],
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IDataView): boolean {
            return fp === other.fingerprint();
        },
        withForecast(): IDataView {
            throw new NotSupported("not supported");
        },
        forecast(): IForecastView {
            return {
                headerItems: [],
                low: [],
                high: [],
                prediction: [],
                loading: false,
            };
        },
        clustering(): IClusteringResult {
            throw new NotSupported("Clustering is not supported by the legacy recorded backend.");
        },
        withClustering(_config?: IClusteringConfig, _result?: IClusteringResult): IDataView {
            throw new NotSupported("Clustering is not supported by the legacy recorded backend.");
        },
        outliers(): IOutliersView {
            return {
                headerItems: [],
                anomalies: [],
                loading: false,
            };
        },
        withOutliers(_config?: IOutliersConfig, _result?: IOutliersResult): IDataView {
            throw new NotSupported("Outliers are not supported by the legacy recorded backend.");
        },
        readCollectionItems(_config: ICollectionItemsConfig): Promise<ICollectionItemsResult> {
            throw new NotSupported("readCollectionItems is not supported by the legacy recorded backend.");
        },
    };
}

function convertDimensions(dims: IResultDimension[]): IDimensionDescriptor[] {
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
    const afmResponse = recording.response.executionResponse as IExecutionResponse;

    const result: IExecutionResult = {
        definition,
        dimensions: convertDimensions(afmResponse.dimensions),
        readAll(): Promise<IDataView> {
            return Promise.resolve(recordedDataView(definition, result, recording));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return Promise.resolve(recordedDataView(definition, result, recording));
        },
        readForecastAll(): Promise<IForecastResult> {
            throw new NotSupported("Forecasting is not supported by the recorded backend.");
        },
        readOutliersAll(): Promise<IOutliersResult> {
            throw new NotSupported("Outliers detection is not supported by the recorded backend.");
        },
        readAnomalyDetectionAll(): Promise<IAnomalyDetectionResult> {
            throw new NotSupported("Anomaly detection is not supported by the recorded backend.");
        },
        readClusteringAll(): Promise<IClusteringResult> {
            throw new NotSupported("Clustering is not supported by the recorded backend.");
        },
        readBinaryStreamAll(): Promise<ReadableStream> {
            throw new NotSupported("Binary Stream results are not supported by the recorded backend.");
        },
        fingerprint(): string {
            return fp;
        },
        resultId(): string | undefined {
            return undefined;
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
        withSignal(_signal: AbortSignal) {
            throw new NotSupported("not supported");
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
        withBuckets(...buckets: IBucket[]) {
            return executionFactory.forDefinition(defWithBuckets(definition, ...buckets));
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
        withSignal(_signal: AbortSignal): IPreparedExecution {
            return recordedPreparedExecution(definition, executionFactory, recordings);
        },
        withContext(_context: IExecutionContext): IPreparedExecution {
            throw new NotSupported("Execution context is not supported by the legacy recorded backend.");
        },
        execute(): Promise<IExecutionResult> {
            return new Promise((resolve, reject) => {
                const recording = recordings.execution?.["fp_" + fp];

                if (recording) {
                    if (definition.postProcessing) {
                        recording.definition = {
                            ...recording.definition,
                            postProcessing: definition.postProcessing,
                        };
                    }
                    resolve(recordedExecutionResult(definition, executionFactory, recording));
                } else {
                    reject(new Error("Recording not found"));
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
