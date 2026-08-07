// (C) 2026 GoodData Corporation

// Builds an IDataView from inline execution-recording data (definition/response/result triple) for
// hermetic chart tests.

import { isEmpty, isEqual } from "lodash-es";

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
    type IPreparedExecutionOptions,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import {
    type DimensionGenerator,
    type IAttributeDescriptor,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeOrMeasure,
    type IBucket,
    type IDimension,
    type IDimensionDescriptor,
    type IExecutionConfig,
    type IExecutionDefinition,
    type IInsight,
    type IInsightDefinition,
    type IMeasureGroupDescriptor,
    type INullableFilter,
    type ISortItem,
    defFingerprint,
    defWithBuckets,
    defWithDateFormat,
    defWithDimensions,
    defWithSorting,
    defaultDimensionsGenerator,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
    uriRef,
} from "@gooddata/sdk-model";

//
// AFM response / result types
//

interface IMeasureHeaderItem {
    measureHeaderItem: {
        uri?: string;
        identifier?: string;
        localIdentifier: string;
        name: string;
        format: string;
    };
}

interface ITotalHeaderItem {
    totalHeaderItem: {
        name: string;
    };
}

interface IMeasureGroupHeader {
    measureGroupHeader: {
        items: IMeasureHeaderItem[];
        totalItems?: ITotalHeaderItem[];
    };
}

interface IAttributeHeader {
    attributeHeader: {
        uri: string;
        identifier: string;
        localIdentifier: string;
        name: string;
        totalItems?: ITotalHeaderItem[];
        formOf: {
            uri: string;
            identifier: string;
            name: string;
        };
    };
}

type IHeader = IMeasureGroupHeader | IAttributeHeader;

interface IResultDimension {
    headers: IHeader[];
}

type DataValue = null | string | number;

interface IResultAttributeHeaderItem {
    attributeHeaderItem: {
        uri: string;
        name: string;
    };
}

interface IResultMeasureHeaderItem {
    measureHeaderItem: {
        name: string;
        order: number;
    };
}

interface IResultTotalHeaderItem {
    totalHeaderItem: {
        name: string;
        type: string;
    };
}

type IResultHeaderItem = IResultAttributeHeaderItem | IResultMeasureHeaderItem | IResultTotalHeaderItem;

interface IWarning {
    warningCode: string;
    message: string;
    parameters?: any[];
}

interface ILocalExecutionResult {
    headerItems?: IResultHeaderItem[][][];
    data: DataValue[][] | DataValue[];
    totals?: DataValue[][][];
    totalTotals?: DataValue[][][];
    paging: {
        count: number[];
        offset: number[];
        total: number[];
    };
    warnings?: IWarning[];
}

interface IExecutionResponse {
    links: {
        executionResult: string;
    };
    dimensions: IResultDimension[];
}

function isAttributeHeader(header: IHeader): header is IAttributeHeader {
    return !isEmpty(header) && (header as IAttributeHeader).attributeHeader !== undefined;
}

//
// Recording types
//

/**
 * Workspace-specific recordings
 */
type ILocalWorkspaceRecordings = {
    execution?: {
        [fp: string]: ILocalExecutionRecording;
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
 */
export type ILocalExecutionRecording = {
    definition: IExecutionDefinition;
    response: any;
    result: any;
};

/**
 * Creates a new data view for the provided recording.
 *
 * @param recording - recorded definition, AFM response and AFM result
 */
export function localDataView(recording: ILocalExecutionRecording): IDataView {
    const definition = recording.definition;
    const executionFactory = new RecordedExecutionFactory({}, recording.definition.workspace);

    const result = recordedExecutionResult(definition, executionFactory, recording);
    return recordedDataView(definition, result, recording);
}

//
// Internals
//

class RecordedExecutionFactory implements IExecutionFactory {
    constructor(
        private readonly recordings: ILocalWorkspaceRecordings,
        private readonly workspace: string,
    ) {}

    public forDefinition(
        def: IExecutionDefinition,
        _options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return recordedPreparedExecution(def, this, this.recordings);
    }

    public forItems(
        items: IAttributeOrMeasure[],
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        const def = defWithDimensions(
            newDefForItems(this.workspace, items, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def, options);
    }

    public forBuckets(
        buckets: IBucket[],
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        const def = defWithDimensions(
            newDefForBuckets(this.workspace, buckets, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def, options);
    }

    public forInsight(
        insight: IInsightDefinition,
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        const def = defWithDimensions(
            newDefForInsight(this.workspace, insight, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def, options);
    }

    public forInsightByRef(
        insight: IInsight,
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return this.forInsight(insight, filters, options);
    }
}

function recordedDataView(
    definition: IExecutionDefinition,
    result: IExecutionResult,
    recording: ILocalExecutionRecording,
): IDataView {
    const afmResult = recording.result.executionResult as ILocalExecutionResult;
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
    recording: ILocalExecutionRecording,
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
    recordings: ILocalWorkspaceRecordings = {},
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
