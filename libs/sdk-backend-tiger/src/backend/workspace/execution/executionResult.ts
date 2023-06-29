// (C) 2019-2023 GoodData Corporation

import {
    ITigerClient,
    AfmExecutionResponse,
    ExecutionResult,
    ActionsApiGetTabularExportRequest,
    TabularExportRequest,
    TabularExportRequestFormatEnum,
} from "@gooddata/api-client-tiger";
import {
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    NoDataError,
    UnexpectedError,
    TimeoutError,
    IExportBlobResult,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, DataValue, IDimensionDescriptor, IResultHeader } from "@gooddata/sdk-model";
import SparkMD5 from "spark-md5";
import { transformResultDimensions } from "../../../convertors/fromBackend/afm/dimensions.js";
import { transformExecutionResult } from "../../../convertors/fromBackend/afm/result.js";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { transformGrandTotalData } from "../../../convertors/fromBackend/afm/GrandTotalsConverter.js";
import { getTransformDimensionHeaders } from "../../../convertors/fromBackend/afm/DimensionHeaderConverter.js";
import { resolveCustomOverride } from "./utils.js";
import { parseNameFromContentDisposition } from "../../../utils/downloadFile.js";

const TIGER_PAGE_SIZE_LIMIT = 1000;
const DEFAULT_POLL_DELAY = 5000;
const MAX_POLL_ATTEMPTS = 50;

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
    ) {
        this.dimensions = transformResultDimensions(
            execResponse.executionResponse.dimensions,
            this.definition,
        );
        this.workspace = this.definition.workspace;
        this.resultId = execResponse.executionResponse.links.executionResult;
        this._fingerprint = SparkMD5.hash(this.resultId);
    }

    public async readAll(): Promise<IDataView> {
        const executionResultPromise = this.authCall((client) =>
            client.executionResult
                .retrieveResult({
                    workspaceId: this.workspace,
                    resultId: this.resultId,
                })
                .then(({ data }) => data),
        );

        return this.asDataView(executionResultPromise);
    }

    public async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const saneOffset = sanitizeOffset(offset);
        const saneSize = sanitizeSize(size);

        const executionResultPromise = this.authCall((client) =>
            client.executionResult
                .retrieveResult({
                    workspaceId: this.workspace,
                    resultId: this.resultId,
                    limit: saneSize,
                    offset: saneOffset,
                })
                .then(({ data }) => data),
        );

        return this.asDataView(executionResultPromise);
    }

    public transform(): IPreparedExecution {
        return this.executionFactory.forDefinition(this.definition);
    }

    public async export(options: IExportConfig): Promise<IExportResult> {
        return this.exportToBlob(options).then((result) => {
            URL.revokeObjectURL(result.objectUrl); // release blob memory as it will not be used
            return {
                uri: result.uri,
            };
        });
    }

    public async exportToBlob(options: IExportConfig): Promise<IExportBlobResult> {
        const isXlsx = options.format?.toUpperCase() === "XLSX";
        const format = isXlsx ? TabularExportRequestFormatEnum.XLSX : TabularExportRequestFormatEnum.CSV;
        const payload: TabularExportRequest = {
            format,
            executionResult: this.resultId,
            fileName: options.title ?? "default",
            settings: isXlsx
                ? {
                      mergeHeaders: Boolean(options.mergeHeaders),
                      showFilters: Boolean(options.showFilters),
                  }
                : undefined,
            customOverride: resolveCustomOverride(this.dimensions, this.definition),
        };

        return this.authCall(async (client) => {
            const tabularExport = await client.export.createTabularExport({
                workspaceId: this.workspace,
                tabularExportRequest: payload,
            });

            return await this.handleExportResultPolling(
                client,
                {
                    workspaceId: this.workspace,
                    exportId: tabularExport?.data?.exportResult,
                },
                format,
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
                    new TigerDataView(this, result, this.dateFormatter),
                );
            }

            return new TigerDataView(this, result, this.dateFormatter);
        });
    };

    private async handleExportResultPolling(
        client: ITigerClient,
        payload: ActionsApiGetTabularExportRequest,
        format: TabularExportRequestFormatEnum,
    ): Promise<IExportBlobResult> {
        for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
            const result = await client.export.getTabularExport(payload, {
                transformResponse: (x) => x,
                responseType: "blob",
            });

            if (result?.status === 200) {
                const type =
                    format === "XLSX"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "text/csv";
                const blob = new Blob([result?.data as any], { type });
                return {
                    uri: result?.config?.url || "",
                    objectUrl: URL.createObjectURL(blob),
                    fileName: parseNameFromContentDisposition(result),
                };
            }

            await new Promise((resolve) => setTimeout(resolve, DEFAULT_POLL_DELAY));
        }

        throw new TimeoutError(
            `Export timeout for export id "${payload.exportId}" in workspace "${payload.workspaceId}"`,
        );
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
    public readonly totalTotals?: DataValue[][][];
    private readonly _fingerprint: string;

    constructor(result: IExecutionResult, execResult: ExecutionResult, dateFormatter: DateFormatter) {
        this.result = result;
        this.definition = result.definition;

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

        this._fingerprint = `${result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    public equals(other: IDataView): boolean {
        return this.fingerprint() === other.fingerprint();
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
