// (C) 2019-2022 GoodData Corporation

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
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, DataValue, IDimensionDescriptor, IResultHeader } from "@gooddata/sdk-model";
import SparkMD5 from "spark-md5";
import { transformResultDimensions } from "../../../convertors/fromBackend/afm/dimensions";
import { transformExecutionResult } from "../../../convertors/fromBackend/afm/result";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { transformGrandTotalData } from "../../../convertors/fromBackend/afm/GrandTotalsConverter";
import { getTransformDimensionHeaders } from "../../../convertors/fromBackend/afm/DimensionHeaderConverter";
import { resolveCustomOverride } from "./utils";

const TIGER_PAGE_SIZE_LIMIT = 1000;
const DEFAULT_POLL_DELAY = 5000;
const MAX_POLL_ATTEMPTS = 50;

function sanitizeOffset(offset: number[]): number[] {
    return offset.map((offsetItem = 0) => offsetItem);
}

function sanitizeSize(size: number[]): number[] {
    return size.map((sizeInDim = TIGER_PAGE_SIZE_LIMIT) => {
        if (sizeInDim > TIGER_PAGE_SIZE_LIMIT) {
            // eslint-disable-next-line no-console
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
        const isXlsx = options.format?.toUpperCase() === "XLSX";
        const payload: TabularExportRequest = {
            // once XLSX will be supported, it will appear in the enum of api client, we would then use
            // format: isXlsx ? TabularExportRequestFormatEnum.CSV : TabularExportRequestFormatEnum.CSV,
            format: TabularExportRequestFormatEnum.CSV,
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
        payload: ActionsApiGetTabularExportRequest,
    ): Promise<IExportResult> {
        for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
            const result = await client.export.getTabularExport(payload, {
                transformResponse: (x) => x,
            });

            if (result?.status === 200) {
                return {
                    uri: result?.config?.url || "",
                };
            }

            await new Promise((resolve) => setTimeout(resolve, DEFAULT_POLL_DELAY));
        }

        throw new Error(
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
    private readonly _fingerprint: string;

    constructor(result: IExecutionResult, execResult: ExecutionResult, dateFormatter: DateFormatter) {
        this.result = result;
        this.definition = result.definition;

        const transformDimensionHeaders = getTransformDimensionHeaders(result.dimensions, dateFormatter);

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
