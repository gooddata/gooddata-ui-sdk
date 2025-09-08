// (C) 2019-2025 GoodData Corporation

import SparkMD5 from "spark-md5";

import {
    ActionsExportGetTabularExportRequest,
    AfmExecutionResponse,
    ExecutionResult,
    ITigerClient,
    Settings,
    TabularExportRequest,
    TabularExportRequestFormatEnum,
} from "@gooddata/api-client-tiger";
import {
    IAnomalyDetectionConfig,
    IAnomalyDetectionResult,
    IClusteringConfig,
    IClusteringResult,
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExecutionResultMetadata,
    IExportConfig,
    IExportResult,
    IForecastConfig,
    IForecastResult,
    IForecastView,
    IPreparedExecution,
    NoDataError,
    TimeoutError,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import { DataValue, IDimensionDescriptor, IExecutionDefinition, IResultHeader } from "@gooddata/sdk-model";

import { resolveCustomOverride } from "./utils.js";
import { TigerCancellationConverter } from "../../../cancelation/index.js";
import {
    getTransformDimensionHeaders,
    getTransformForecastHeaders,
} from "../../../convertors/fromBackend/afm/DimensionHeaderConverter.js";
import { transformResultDimensions } from "../../../convertors/fromBackend/afm/dimensions.js";
import { transformForecastResult } from "../../../convertors/fromBackend/afm/forecast.js";
import { transformGrandTotalData } from "../../../convertors/fromBackend/afm/GrandTotalsConverter.js";
import { convertExecutionResultMetadata } from "../../../convertors/fromBackend/afm/MetadataConverter.js";
import { transformExecutionResult } from "../../../convertors/fromBackend/afm/result.js";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { parseNameFromContentDisposition } from "../../../utils/downloadFile.js";

const TIGER_PAGE_SIZE_LIMIT = 1000;
const DEFAULT_POLL_DELAY = 5000;
const MAX_POLL_ATTEMPTS = 50;

function isTabularExportFormat(format: string = ""): format is keyof typeof TabularExportRequestFormatEnum {
    return format in TabularExportRequestFormatEnum;
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
            signal,
            this.resultCancelToken,
        );
    };

    public async readAll(): Promise<IDataView> {
        const executionResultPromise = this.authCall((client) =>
            client.executionResult
                .retrieveResult(
                    {
                        workspaceId: this.workspace,
                        resultId: this.resultId,
                    },
                    this.enrichClientWithCancelOptions(),
                )
                .then(({ data }) => data),
        );

        return this.asDataView(executionResultPromise);
    }

    public async readForecastAll(forecastConfig: IForecastConfig): Promise<IForecastResult> {
        const workspace = this.workspace;
        const resultId = this.resultId;

        const forecast = await this.authCall((client) =>
            client.smartFunctions
                .forecast(
                    {
                        forecastRequest: forecastConfig,
                        workspaceId: workspace,
                        resultId: resultId,
                    },
                    this.enrichClientWithCancelOptions(),
                )
                .then(({ data }) => data),
        );

        return this.authCall((client) =>
            client.smartFunctions
                .forecastResult(
                    {
                        workspaceId: workspace,
                        resultId: forecast.links.executionResult,
                    },
                    this.enrichClientWithCancelOptions(),
                )
                .then(({ data }) => data),
        );
    }

    public async readAnomalyDetectionAll(config: IAnomalyDetectionConfig): Promise<IAnomalyDetectionResult> {
        const workspaceId = this.workspace;
        const resultId = this.resultId;
        const sensitivity = config.sensitivity;

        const anomalyDetection = await this.authCall((client) =>
            client.smartFunctions.anomalyDetection(
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
            client.smartFunctions.anomalyDetectionResult(
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
            client.smartFunctions.clustering(
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
            client.smartFunctions.clusteringResult(
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
            client.executionResult
                .retrieveResult(
                    {
                        workspaceId: this.workspace,
                        resultId: this.resultId,
                        limit: saneSize,
                        offset: saneOffset,
                    },
                    this.enrichClientWithCancelOptions(),
                )
                .then(({ data }) => data),
        );

        return this.asDataView(executionResultPromise);
    }

    public transform(): IPreparedExecution {
        return this.executionFactory.forDefinition(this.definition, { signal: this.signal });
    }

    public async export(options: IExportConfig): Promise<IExportResult> {
        const uppercaseFormat = options.format?.toUpperCase();
        const format = isTabularExportFormat(uppercaseFormat)
            ? TabularExportRequestFormatEnum[uppercaseFormat]
            : TabularExportRequestFormatEnum.CSV;

        const settings: Settings = {
            ...(format === TabularExportRequestFormatEnum.XLSX
                ? { mergeHeaders: Boolean(options.mergeHeaders), showFilters: Boolean(options.showFilters) }
                : {}),
            ...(format === TabularExportRequestFormatEnum.PDF
                ? {
                      showFilters: Boolean(options.showFilters),
                      pdfPageSize: options.pdfConfiguration?.pdfPageSize,
                      pdfTopLeftContent: options.pdfConfiguration?.pdfTopLeftContent,
                      pdfTopRightContent: options.pdfConfiguration?.pdfTopRightContent,
                  }
                : {}),
        };

        const payload: TabularExportRequest = {
            format,
            executionResult: options.visualizationObjectId ? undefined : this.resultId, // use the visualizationObject for the export instead of the execution when provided
            fileName: options.title ?? "default",
            settings,
            customOverride: resolveCustomOverride(this.dimensions, this.definition),
            visualizationObject: options.visualizationObjectId,
            visualizationObjectCustomFilters: options.visualizationObjectCustomFilters,
        };

        return this.authCall(async (client) => {
            const tabularExport = await client.export.createTabularExport({
                workspaceId: this.workspace,
                exportTabularExportRequest: payload,
            });

            return await this.handleExportResultPolling(client, {
                workspaceId: this.workspace,
                exportId: tabularExport?.data?.exportResult,
            });
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
                    new TigerDataView(this, result, this.dateFormatter),
                );
            }

            return new TigerDataView(this, result, this.dateFormatter);
        });
    };

    private async handleExportResultPolling(
        client: ITigerClient,
        payload: ActionsExportGetTabularExportRequest,
    ): Promise<IExportResult> {
        for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
            const result = await client.export.getTabularExport(payload, {
                transformResponse: (x) => x,
                responseType: "blob",
            });

            if (result?.status === 200) {
                return {
                    uri: result.config?.url || "",
                    objectUrl: URL.createObjectURL(result.data),
                    fileName: parseNameFromContentDisposition(result),
                };
            }

            await new Promise((resolve) => setTimeout(resolve, DEFAULT_POLL_DELAY));
        }

        throw new TimeoutError(
            `Export timeout for export id "${payload.exportId}" in workspace "${payload.workspaceId}"`,
        );
    }

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
    public readonly clusteringConfig?: IClusteringConfig;
    public readonly clusteringResult?: IClusteringResult;
    public readonly totalTotals?: DataValue[][][];
    public readonly metadata: IExecutionResultMetadata;
    private readonly _fingerprint: string;
    private readonly _execResult: ExecutionResult;
    private readonly _dateFormatter: DateFormatter;

    constructor(
        result: IExecutionResult,
        execResult: ExecutionResult,
        dateFormatter: DateFormatter,
        forecastConfig?: IForecastConfig,
        forecastResult?: IForecastResult,
        clusteringConfig?: IClusteringConfig,
        clusteringResult?: IClusteringResult,
    ) {
        this.result = result;
        this.definition = result.definition;
        this.forecastConfig = forecastConfig;
        this.forecastResult = forecastResult;
        this.clusteringConfig = clusteringConfig;
        this.clusteringResult = clusteringResult;

        this._execResult = execResult;
        this._dateFormatter = dateFormatter;

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
            normalizedConfig,
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
            this.forecastConfig,
            this.forecastResult,
            config,
            result,
        );
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
