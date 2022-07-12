// (C) 2019-2022 GoodData Corporation

import { AfmExecutionResponse, ExecutionResult } from "@gooddata/api-client-tiger";
import {
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    NoDataError,
    NotSupported,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    IExecutionDefinition,
    DataValue,
    IDimensionDescriptor,
    IResultHeader,
    isMeasureGroupDescriptor,
    measureMasterIdentifier,
    isAttributeDescriptor,
} from "@gooddata/sdk-model";
import SparkMD5 from "spark-md5";
import { transformResultDimensions } from "../../../convertors/fromBackend/afm/dimensions";
import { transformExecutionResult } from "../../../convertors/fromBackend/afm/result";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { transformGrandTotalData } from "../../../convertors/fromBackend/afm/GrandTotalsConverter";
import { getTransformDimensionHeaders } from "../../../convertors/fromBackend/afm/DimensionHeaderConverter";

const TIGER_PAGE_SIZE_LIMIT = 1000;

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
        type ExportMetrics = {
            [key: string]: {
                title?: string;
                format?: string;
            };
        };

        type ExportLabels = {
            [key: string]: {
                title?: string;
            };
        };

        const metrics: ExportMetrics = {};
        const labels: ExportLabels = {};

        // get measure alias or title, and format
        this.definition.measures.forEach((measure) => {
            const { localIdentifier, alias, title, format } = measure.measure;
            metrics[localIdentifier] = {
                title: alias || title,
                format,
            };
        });

        // get format for derived measures from master
        this.definition.measures.forEach((measure) => {
            const masterId = measureMasterIdentifier(measure);
            const derivedId = measure.measure.localIdentifier;
            if (masterId) {
                if (metrics[masterId].format) {
                    metrics[derivedId].format = metrics[masterId].format;
                } else {
                    this.dimensions.forEach((dimension) =>
                        dimension.headers.forEach((header) => {
                            if (isMeasureGroupDescriptor(header)) {
                                header.measureGroupHeader.items.forEach((item) => {
                                    const { localIdentifier, format } = item.measureHeaderItem;
                                    if (localIdentifier === masterId) {
                                        metrics[derivedId].format = format;
                                    }
                                });
                            }
                        }),
                    );
                }
            }
        });

        // get attribute alias
        this.definition.attributes.forEach((attribute) => {
            const { localIdentifier, alias } = attribute.attribute;
            labels[localIdentifier] = { title: alias };
        });

        // if nothing from before gives needed info, take from dimensions
        this.dimensions.forEach((dimension) =>
            dimension.headers.forEach((header) => {
                if (isMeasureGroupDescriptor(header)) {
                    header.measureGroupHeader.items.forEach((item) => {
                        const { localIdentifier, name, format } = item.measureHeaderItem;
                        if (!metrics[localIdentifier].title) {
                            metrics[localIdentifier].title = name;
                        }
                        if (!metrics[localIdentifier].format) {
                            metrics[localIdentifier].format = format;
                        }
                    });
                }
                if (isAttributeDescriptor(header)) {
                    const { localIdentifier, formOf } = header.attributeHeader;
                    if (!labels[localIdentifier].title) {
                        labels[localIdentifier].title = formOf.name;
                    }
                }
            }),
        );

        const payload = {
            format: options.format?.toUpperCase(),
            executionResult: this.resultId,
            fileName: options.title,
            settings: {
                mergeHeaders: Boolean(options.mergeHeaders),
                showFilters: Boolean(options.showFilters),
            },
            customOverrides: {
                metrics,
                labels,
            },
        };

        console.log(payload);
        // TODO: drop payload into api call when it will be ready on Tiger

        return Promise.reject(new NotSupported("Tiger backend does not support exports"));
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
