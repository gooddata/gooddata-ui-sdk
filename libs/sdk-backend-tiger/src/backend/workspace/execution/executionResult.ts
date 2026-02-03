// (C) 2019-2026 GoodData Corporation

import SparkMD5 from "spark-md5";

import {
    type AfmExecutionResponse,
    type ExecutionResult,
    type Settings,
    type TabularExportRequest,
    type TabularExportRequestFormatEnum,
} from "@gooddata/api-client-tiger";
import { ExecutionResultAPI_RetrieveResult } from "@gooddata/api-client-tiger/endpoints/execution";
import { ExportApi_CreateTabularExport } from "@gooddata/api-client-tiger/endpoints/export";
import {
    ResultApi_GetCollectionItems,
    ResultApi_GetCustomCollectionItems,
} from "@gooddata/api-client-tiger/endpoints/result";
import {
    SmartFunctionsApi_AnomalyDetection,
    SmartFunctionsApi_AnomalyDetectionResult,
    SmartFunctionsApi_Clustering,
    SmartFunctionsApi_ClusteringResult,
    SmartFunctionsApi_Forecast,
    SmartFunctionsApi_ForecastResult,
    SmartFunctionsApi_OutlierDetection,
    SmartFunctionsApi_OutlierDetectionResult,
} from "@gooddata/api-client-tiger/endpoints/smartFunctions";
import {
    type IAnomalyDetectionConfig,
    type IAnomalyDetectionResult,
    type IClusteringConfig,
    type IClusteringResult,
    type ICollectionItemsConfig,
    type ICollectionItemsResult,
    type IDataView,
    type IExecutionContext,
    type IExecutionFactory,
    type IExecutionResult,
    type IExecutionResultMetadata,
    type IExportConfig,
    type IExportResult,
    type IForecastConfig,
    type IForecastResult,
    type IForecastView,
    type IOutliersConfig,
    type IOutliersResult,
    type IOutliersView,
    type IPreparedExecution,
    NoDataError,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    type DataValue,
    type IDimensionDescriptor,
    type IExecutionDefinition,
    type IGeoJsonFeature,
    type IResultHeader,
} from "@gooddata/sdk-model";

import { augmentCustomOverrideWithNormalizedKeys, resolveCustomOverride } from "./utils.js";
import { TigerCancellationConverter } from "../../../cancelation/index.js";
import {
    getAnomalyDetectionDateAttributes,
    getAnomalyDetectionGranularity,
    getTransformAnomalyDetectionHeader,
    getTransformDimensionHeaders,
    getTransformForecastHeaders,
} from "../../../convertors/fromBackend/afm/DimensionHeaderConverter.js";
import { transformResultDimensions } from "../../../convertors/fromBackend/afm/dimensions.js";
import { transformForecastResult } from "../../../convertors/fromBackend/afm/forecast.js";
import { transformGrandTotalData } from "../../../convertors/fromBackend/afm/GrandTotalsConverter.js";
import { convertExecutionResultMetadata } from "../../../convertors/fromBackend/afm/MetadataConverter.js";
import { transformOutliersResult } from "../../../convertors/fromBackend/afm/outliers.js";
import { transformExecutionResult } from "../../../convertors/fromBackend/afm/result.js";
import { type DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { toAfmExecution } from "../../../convertors/toBackend/afm/toAfmResultSpec.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { handleExportResultPolling } from "../../../utils/exportPolling.js";

const TIGER_PAGE_SIZE_LIMIT = 1000;

const TABULAR_EXPORT_FORMATS: TabularExportRequestFormatEnum[] = ["CSV", "XLSX", "HTML", "PDF"];

function isTabularExportFormat(format: string = ""): format is TabularExportRequestFormatEnum {
    return TABULAR_EXPORT_FORMATS.includes(format as TabularExportRequestFormatEnum);
}

function sanitizeOffset(offset: number[]): number[] {
    return offset.map((offsetItem = 0) => offsetItem);
}

function sanitizeSize(size: number[]): number[] {
    return size.map((sizeInDim = TIGER_PAGE_SIZE_LIMIT) => {
        if (sizeInDim > TIGER_PAGE_SIZE_LIMIT) {
            console.warn("The maximum limit per page is " + TIGER_PAGE_SIZE_LIMIT);

            return TIGER_PAGE_SIZE_LIMIT;
        }
        return sizeInDim;
    });
}

export class TigerExecutionResult implements IExecutionResult {
    private readonly workspace: string;
    public readonly dimensions: IDimensionDescriptor[];
    private readonly resultId: string;
    private readonly _fingerprint: string;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
        readonly execResponse: AfmExecutionResponse,
        private readonly dateFormatter: DateFormatter,
        public readonly context?: IExecutionContext,
        public readonly signal?: AbortSignal,
        private readonly resultCancelToken?: string,
    ) {
        this.dimensions = transformResultDimensions(
            execResponse.executionResponse.dimensions,
            this.definition,
        );
        this.workspace = this.definition.workspace;
        this.resultId = execResponse.executionResponse.links.executionResult;
        this._fingerprint = SparkMD5.hash(this.resultId);
    }

    public withSignal = (signal: AbortSignal): IExecutionResult => {
        return new TigerExecutionResult(
            this.authCall,
            this.definition,
            this.executionFactory,
            this.execResponse,
            this.dateFormatter,
            this.context,
            signal,
            this.resultCancelToken,
        );
    };

    public async readAll(): Promise<IDataView> {
        const executionResultPromise = this.authCall((client) =>
            ExecutionResultAPI_RetrieveResult(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    resultId: this.resultId,
                },
                this.enrichClientWithCancelOptions(),
            ).then(({ data }) => data),
        );

        return this.asDataView(executionResultPromise);
    }

    public async readForecastAll(forecastConfig: IForecastConfig): Promise<IForecastResult> {
        const workspace = this.workspace;
        const resultId = this.resultId;

        const forecast = await this.authCall((client) =>
            SmartFunctionsApi_Forecast(
                client.axios,
                client.basePath,
                {
                    forecastRequest: forecastConfig,
                    workspaceId: workspace,
                    resultId: resultId,
                },
                this.enrichClientWithCancelOptions(),
            ).then(({ data }) => data),
        );

        return this.authCall((client) =>
            SmartFunctionsApi_ForecastResult(
                client.axios,
                client.basePath,
                {
                    workspaceId: workspace,
                    resultId: forecast.links.executionResult,
                },
                this.enrichClientWithCancelOptions(),
            ).then(({ data }) => data),
        );
    }

    public async readOutliersAll(outliersConfig: IOutliersConfig): Promise<IOutliersResult> {
        const workspace = this.workspace;
        const res = this.dimensions;

        const afmExecution = toAfmExecution(this.definition);
        const granularity = getAnomalyDetectionGranularity(res, outliersConfig);

        const forecast = await this.authCall((client) =>
            SmartFunctionsApi_OutlierDetection(
                client.axios,
                client.basePath,
                {
                    outlierDetectionRequest: {
                        sensitivity: outliersConfig.sensitivity.toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
                        granularity: granularity,
                        filters: afmExecution.execution.filters,
                        attributes: afmExecution.execution.attributes,
                        measures: afmExecution.execution.measures,
                        auxMeasures: afmExecution.execution.auxMeasures,
                    },
                    workspaceId: workspace,
                },
                this.enrichClientWithCancelOptions(),
            ).then(({ data }) => data),
        );

        const data = await this.authCall((client) =>
            SmartFunctionsApi_OutlierDetectionResult(
                client.axios,
                client.basePath,
                {
                    workspaceId: workspace,
                    resultId: forecast.links.executionResult,
                },
                this.enrichClientWithCancelOptions(),
            ).then(({ data }) => data),
        );

        return {
            attributes: (data.attribute ?? []).slice(),
            metrics: Object.entries(data.values ?? {}).map(([localIdentifier, values]) => ({
                localIdentifier,
                values: values ?? [],
            })),
        };
    }

    public async readAnomalyDetectionAll(config: IAnomalyDetectionConfig): Promise<IAnomalyDetectionResult> {
        const workspaceId = this.workspace;
        const resultId = this.resultId;
        const sensitivity = config.sensitivity;

        const anomalyDetection = await this.authCall((client) =>
            SmartFunctionsApi_AnomalyDetection(
                client.axios,
                client.basePath,
                {
                    anomalyDetectionRequest: {
                        sensitivity,
                    },
                    resultId,
                    workspaceId,
                },
                this.enrichClientWithCancelOptions(),
            ),
        );

        const anomalyResult = await this.authCall((client) =>
            SmartFunctionsApi_AnomalyDetectionResult(
                client.axios,
                client.basePath,
                {
                    resultId: anomalyDetection.data.links.executionResult,
                    workspaceId: this.workspace,
                },
                this.enrichClientWithCancelOptions(),
            ),
        );

        return anomalyResult.data;
    }

    public async readClusteringAll(clusteringConfig: IClusteringConfig): Promise<IClusteringResult> {
        const workspaceId = this.workspace;
        const resultId = this.resultId;
        const numberOfClusters = clusteringConfig.numberOfClusters;
        const threshold = clusteringConfig.threshold ? { threshold: clusteringConfig.threshold } : {};

        const clustering = await this.authCall((client) =>
            SmartFunctionsApi_Clustering(
                client.axios,
                client.basePath,
                {
                    clusteringRequest: {
                        numberOfClusters,
                        ...threshold,
                    },
                    resultId,
                    workspaceId,
                },
                this.enrichClientWithCancelOptions(),
            ),
        );

        const clusteringResult = await this.authCall((client) =>
            SmartFunctionsApi_ClusteringResult(
                client.axios,
                client.basePath,
                {
                    resultId: clustering.data.links.executionResult,
                    workspaceId: this.workspace,
                },
                this.enrichClientWithCancelOptions(),
            ),
        );

        const { attribute, clusters, xcoord, ycoord } = clusteringResult.data;

        return {
            attribute: attribute as unknown as string[], // OpenAPI definition has wrong typing
            clusters,
            xcoord,
            ycoord,
        };
    }

    public async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const saneOffset = sanitizeOffset(offset);
        const saneSize = sanitizeSize(size);

        const executionResultPromise = this.authCall((client) =>
            ExecutionResultAPI_RetrieveResult(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    resultId: this.resultId,
                    limit: saneSize,
                    offset: saneOffset,
                },
                this.enrichClientWithCancelOptions(),
            ).then(({ data }) => data),
        );

        return this.asDataView(executionResultPromise);
    }

    public transform(): IPreparedExecution {
        return this.executionFactory.forDefinition(this.definition, {
            signal: this.signal,
            context: this.context,
        });
    }

    public async export(options: IExportConfig): Promise<IExportResult> {
        const uppercaseFormat = options.format?.toUpperCase();
        const format = isTabularExportFormat(uppercaseFormat) ? uppercaseFormat : "CSV";
        const settings: Settings = {
            ...(format === "XLSX"
                ? {
                      mergeHeaders: Boolean(options.mergeHeaders),
                      exportInfo: Boolean(options.showFilters),
                  }
                : {}),
            ...(format === "PDF"
                ? {
                      pageSize: options.pdfConfiguration?.pageSize,
                      pageOrientation: options.pdfConfiguration?.pageOrientation,
                      exportInfo: options.pdfConfiguration?.showInfoPage,
                      // Deprecated properties for backward compatibility
                      showFilters: options.showFilters,
                      pdfPageSize: options.pdfConfiguration?.pdfPageSize,
                      pdfTopLeftContent: options.pdfConfiguration?.pdfTopLeftContent,
                      pdfTopRightContent: options.pdfConfiguration?.pdfTopRightContent,
                  }
                : {}),
        };

        const customOverride = resolveCustomOverride(this.dimensions, this.definition);
        const augmented = augmentCustomOverrideWithNormalizedKeys(customOverride, this.definition);

        const payload: TabularExportRequest = {
            format,
            executionResult: options.visualizationObjectId ? undefined : this.resultId, // use the visualizationObject for the export instead of the execution when provided
            fileName: options.title ?? "default",
            settings,
            customOverride: augmented,
            visualizationObject: options.visualizationObjectId,
            visualizationObjectCustomFilters: options.visualizationObjectCustomFilters,
        };

        return this.authCall(async (client) => {
            const tabularExport = await ExportApi_CreateTabularExport(client.axios, client.basePath, {
                workspaceId: this.workspace,
                exportTabularExportRequest: payload,
            });

            return await handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: tabularExport?.data?.exportResult,
                },
                "getTabularExport",
                options.timeout,
            );
        });
    }

    public equals(other: IExecutionResult): boolean {
        return this.fingerprint() === other.fingerprint();
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    private asDataView = (promisedRes: Promise<ExecutionResult>): Promise<IDataView> => {
        return promisedRes.then((result) => {
            if (!result) {
                // TODO: SDK8: investigate when can this actually happen; perhaps end of data during paging?
                //  perhaps legitimate NoDataCase?
                throw new UnexpectedError("Server returned no data");
            }

            if (isEmptyDataResult(result)) {
                throw new NoDataError(
                    "The execution resulted in no data to display.",
                    new TigerDataView(this, result, this.dateFormatter, this.authCall),
                );
            }

            return new TigerDataView(this, result, this.dateFormatter, this.authCall);
        });
    };

    private enrichClientWithCancelOptions() {
        const signalCancelToken = this.signal ? new TigerCancellationConverter(this.signal).forAxios() : {};
        const resultCancelToken = this.resultCancelToken
            ? {
                  headers: {
                      "X-Gdc-Cancel-Token": this.resultCancelToken,
                  },
              }
            : {};

        return {
            ...signalCancelToken,
            ...resultCancelToken,
        };
    }
}

class TigerDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly definition: IExecutionDefinition;
    public readonly headerItems: IResultHeader[][][];
    public readonly totalCount: number[];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly result: IExecutionResult;
    public readonly totals?: DataValue[][][];
    public readonly forecastConfig?: IForecastConfig;
    public readonly forecastResult?: IForecastResult;
    public readonly outliersConfig?: IOutliersConfig;
    public readonly outliersResult?: IOutliersResult;
    public readonly clusteringConfig?: IClusteringConfig;
    public readonly clusteringResult?: IClusteringResult;
    public readonly totalTotals?: DataValue[][][];
    public readonly metadata: IExecutionResultMetadata;
    public readonly context?: IExecutionContext;
    private readonly _fingerprint: string;
    private readonly _execResult: ExecutionResult;
    private readonly _dateFormatter: DateFormatter;
    private readonly _authCall: TigerAuthenticatedCallGuard;

    constructor(
        result: IExecutionResult,
        execResult: ExecutionResult,
        dateFormatter: DateFormatter,
        authCall: TigerAuthenticatedCallGuard,
        forecastConfig?: IForecastConfig,
        forecastResult?: IForecastResult,
        outliersConfig?: IOutliersConfig,
        outliersResult?: IOutliersResult,
        clusteringConfig?: IClusteringConfig,
        clusteringResult?: IClusteringResult,
    ) {
        this.result = result;
        this.definition = result.definition;
        this.forecastConfig = forecastConfig;
        this.forecastResult = forecastResult;
        this.outliersConfig = outliersConfig;
        this.outliersResult = outliersResult;
        this.clusteringConfig = clusteringConfig;
        this.clusteringResult = clusteringResult;

        this._execResult = execResult;
        this._dateFormatter = dateFormatter;
        this._authCall = authCall;

        const transformDimensionHeaders = getTransformDimensionHeaders(
            result.dimensions,
            dateFormatter,
            execResult.grandTotals,
        );

        const transformedResult = transformExecutionResult(execResult, transformDimensionHeaders);

        this.data = transformedResult.data;
        this.headerItems = transformedResult.headerItems;
        this.offset = transformedResult.offset;
        this.count = transformedResult.count;
        this.totalCount = transformedResult.total;

        this.totals = transformGrandTotalData(
            execResult.grandTotals ?? [],
            result.definition,
            transformedResult.headerItems,
            transformDimensionHeaders,
        );

        const grandTotalItem = execResult.grandTotals?.find((item) => item?.totalDimensions?.length === 0);
        const totalTotals = grandTotalItem?.data as DataValue[][];
        this.totalTotals = totalTotals ? [totalTotals] : undefined;

        this.metadata = convertExecutionResultMetadata(this._execResult.metadata);
        this.context = result.context;

        this._fingerprint = `${result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}/f:${
            this.forecastConfig?.forecastPeriod
        },${this.forecastConfig?.confidenceLevel},${this.forecastConfig?.seasonal}`;
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    public equals(other: IDataView): boolean {
        return this.fingerprint() === other.fingerprint();
    }

    public forecast(): IForecastView {
        const transformForecastHeaders = getTransformForecastHeaders(
            this.result.dimensions,
            this._dateFormatter,
            this.forecastConfig,
        );

        return transformForecastResult(
            this._execResult,
            this.forecastResult,
            this.forecastConfig,
            transformForecastHeaders,
        );
    }

    public clustering(): IClusteringResult {
        return (
            this.clusteringResult ?? {
                attribute: [],
                clusters: [],
                xcoord: [],
                ycoord: [],
            }
        );
    }

    public outliers(): IOutliersView {
        const transformOutliersHeaders = getTransformAnomalyDetectionHeader(
            this.result.dimensions,
            this.outliersConfig,
        );
        const dateAttributes = getAnomalyDetectionDateAttributes(
            this.result.dimensions,
            this._execResult,
            this.outliersConfig,
        );

        return transformOutliersResult(
            this._execResult,
            this.outliersResult,
            this.outliersConfig,
            dateAttributes,
            transformOutliersHeaders,
        );
    }

    public withForecast(config?: IForecastConfig, result?: IForecastResult): IDataView {
        const normalizedConfig = config
            ? {
                  ...config,
                  forecastPeriod: Math.min(config.forecastPeriod, Math.max((this.count[1] ?? 0) - 1, 0)),
              }
            : undefined;

        return new TigerDataView(
            this.result,
            this._execResult,
            this._dateFormatter,
            this._authCall,
            normalizedConfig,
            result,
            this.outliersConfig,
            this.outliersResult,
            this.clusteringConfig,
            this.clusteringResult,
        );
    }

    public withOutliers(config?: IOutliersConfig, result?: IOutliersResult): IDataView {
        return new TigerDataView(
            this.result,
            this._execResult,
            this._dateFormatter,
            this._authCall,
            this.forecastConfig,
            this.forecastResult,
            config,
            result,
            this.clusteringConfig,
            this.clusteringResult,
        );
    }

    public withClustering(config?: IClusteringConfig, result?: IClusteringResult): IDataView {
        return new TigerDataView(
            this.result,
            this._execResult,
            this._dateFormatter,
            this._authCall,
            this.forecastConfig,
            this.forecastResult,
            this.outliersConfig,
            this.outliersResult,
            config,
            result,
        );
    }

    public async readCollectionItems(config: ICollectionItemsConfig): Promise<ICollectionItemsResult> {
        const requestParams = {
            collectionId: config.collectionId,
            limit: config.limit,
            bbox: config.bbox,
            values: config.values,
        };

        const requestOptions = {
            headers: {
                Accept: "application/geo+json",
            },
        };

        // Use different endpoint based on collection kind
        const apiCall =
            config.kind === "CUSTOM" ? ResultApi_GetCustomCollectionItems : ResultApi_GetCollectionItems;

        const response = await this._authCall((client) =>
            apiCall(client.axios, client.basePath, requestParams, requestOptions),
        );

        const { data } = response;

        return {
            type: data.type,
            features: (data.features as IGeoJsonFeature[]) ?? [],
            bbox: data.bbox,
        };
    }
}

function hasEmptyData(result: ExecutionResult): boolean {
    return result.data.length === 0;
}

function hasMissingDimensionHeaders(result: ExecutionResult): boolean {
    /*
     * messy fix to tiger's afm always returning dimension headers with no content
     */
    const firstDimHeaders = result.dimensionHeaders?.[0]?.headerGroups?.[0]?.headers?.[0];
    const secondDimHeaders = result.dimensionHeaders?.[1]?.headerGroups?.[0]?.headers?.[0];

    return !result.dimensionHeaders || (!firstDimHeaders && !secondDimHeaders);
}

function isEmptyDataResult(result: ExecutionResult): boolean {
    return hasEmptyData(result) && hasMissingDimensionHeaders(result);
}
