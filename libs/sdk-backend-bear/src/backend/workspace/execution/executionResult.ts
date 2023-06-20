// (C) 2019-2023 GoodData Corporation

import { GdcExecution, GdcExport } from "@gooddata/api-model-bear";
import { transformResultHeaders } from "@gooddata/sdk-backend-base";
import {
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    NoDataError,
    UnexpectedError,
    IExportBlobResult,
} from "@gooddata/sdk-backend-spi";
import {
    IExecutionDefinition,
    DataValue,
    IDimensionDescriptor,
    IResultHeader,
    IResultWarning,
    bucketsMeasures,
    bucketsFind,
    isAttribute,
    isResultMeasureHeader,
    isTotalDescriptor,
} from "@gooddata/sdk-model";
import SparkMD5 from "spark-md5";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertExecutionApiError } from "../../../utils/errorHandling";
import { toAfmExecution } from "../../../convertors/toBackend/afm/ExecutionConverter";
import { convertWarning, convertDimensions } from "../../../convertors/fromBackend/ExecutionResultConverter";
import { createResultHeaderTransformer } from "../../../convertors/fromBackend/afm/result";
import { findDateAttributeUris } from "../../../convertors/dateFormatting/dateFormatter";

export class BearExecutionResult implements IExecutionResult {
    public readonly dimensions: IDimensionDescriptor[];
    private readonly _fingerprint: string;

    constructor(
        private readonly authApiCall: BearAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly execFactory: IExecutionFactory,
        private readonly execResponse: GdcExecution.IExecutionResponse,
    ) {
        this.dimensions = convertDimensions(execResponse.dimensions);
        this._fingerprint = SparkMD5.hash(execResponse.links.executionResult);
    }

    public async readAll(): Promise<IDataView> {
        return this.asDataView(
            this.authApiCall(
                (sdk) => sdk.execution.getExecutionResult(this.execResponse.links.executionResult),
                convertExecutionApiError,
            ),
        );
    }

    public async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const saneOffset = sanitizeOffset(offset);
        const saneSize = sanitizeSize(size);

        return this.asDataView(
            this.authApiCall(
                (sdk) =>
                    sdk.execution.getPartialExecutionResult(
                        this.execResponse.links.executionResult,
                        saneSize,
                        saneOffset,
                    ),
                convertExecutionApiError,
            ),
        );
    }

    public transform(): IPreparedExecution {
        return this.execFactory.forDefinition(this.definition);
    }

    public async export(options: IExportConfig): Promise<IExportResult> {
        const optionsForBackend = this.buildExportOptions(options);
        return this.authApiCall((sdk) =>
            sdk.report.exportResult(
                this.definition.workspace,
                this.execResponse.links.executionResult,
                optionsForBackend,
            ),
        );
    }

    public async exportToBlob(options: IExportConfig): Promise<IExportBlobResult> {
        const optionsForBackend = this.buildExportOptions(options);
        return this.authApiCall((sdk) =>
            sdk.report.exportResultToBlob(
                this.definition.workspace,
                this.execResponse.links.executionResult,
                optionsForBackend,
            ),
        );
    }

    private buildExportOptions(options: IExportConfig): GdcExport.IExportConfig {
        const optionsForBackend: GdcExport.IExportConfig = {
            format: options.format,
            mergeHeaders: options.mergeHeaders,
            title: options.title,
            showFilters: options.showFilters,
        };

        if (options.showFilters) {
            optionsForBackend.afm = toAfmExecution(this.definition).execution.afm;
        }

        return optionsForBackend;
    }

    public equals(other: IExecutionResult): boolean {
        return this.fingerprint() === other.fingerprint();
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    private asDataView: DataViewFactory = (promisedRes) => {
        return promisedRes.then((res) => {
            if (!res) {
                // TODO: SDK8: investigate when can this actually happen; perhaps end of data during paging?
                //  perhaps legitimate NoDataCase?
                throw new UnexpectedError("Server returned no data");
            }

            if (isEmptyDataResult(res)) {
                throw new NoDataError(
                    "The execution resulted in no data to display.",
                    new BearDataView(this, res),
                );
            }

            return new BearDataView(this, res);
        });
    };
}

const BEAR_PAGE_SIZE_LIMIT = 1000;

function sanitizeOffset(offset: number[]): number[] {
    return offset.map((offsetItem = 0) => offsetItem);
}

function sanitizeSize(size: number[]): number[] {
    return size.map((sizeInDim = BEAR_PAGE_SIZE_LIMIT) => {
        if (sizeInDim > BEAR_PAGE_SIZE_LIMIT) {
            console.warn("The maximum limit per page is " + BEAR_PAGE_SIZE_LIMIT);

            return BEAR_PAGE_SIZE_LIMIT;
        }
        return sizeInDim;
    });
}

type DataViewFactory = (promisedRes: Promise<GdcExecution.IExecutionResult | null>) => Promise<IDataView>;

function preprocessTotalHeaderItems(
    headerItems: IResultHeader[][][],
    definition: IExecutionDefinition,
): IResultHeader[][][] {
    const columnTotals = definition?.dimensions[1]?.totals;
    if (!columnTotals?.length) {
        // noop when no column totals are present
        return headerItems;
    }

    const buckets = definition.buckets;
    const measures = bucketsMeasures(buckets);
    const columns = bucketsFind(buckets, "columns")?.items || [];
    const columnIdentifiers = columns.map((item) => isAttribute(item) && item.attribute?.localIdentifier);
    const measuresIdentifiers = measures.map((m) => m.measure.localIdentifier);

    const newColumnTotals = [...columnTotals];
    newColumnTotals.sort(
        (a, b) =>
            measuresIdentifiers.indexOf(a.measureIdentifier) -
            measuresIdentifiers.indexOf(b.measureIdentifier),
    );

    const lookups = newColumnTotals
        .filter((total) => {
            return columnIdentifiers.includes(total.attributeIdentifier);
        })
        .map((total) => {
            return measures.findIndex((m) => m.measure?.localIdentifier === total.measureIdentifier);
        });

    const uniqueLookups = lookups.filter((lookup, index) => lookups.indexOf(lookup) === index);

    return headerItems.map((topHeaderItems) => {
        return topHeaderItems.map((items) => {
            // process only header items with measures
            let count = 0;
            if (items.find(isResultMeasureHeader)) {
                return items.map((item) => {
                    if (isTotalDescriptor(item)) {
                        const result = {
                            ...item,
                            totalHeaderItem: {
                                ...item?.totalHeaderItem,
                                measureIndex: uniqueLookups[count % uniqueLookups.length],
                            },
                        };

                        count++;
                        return result;
                    }

                    return item;
                });
            }

            return items;
        });
    });
}

class BearDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly definition: IExecutionDefinition;
    public readonly headerItems: IResultHeader[][][];
    public readonly totalCount: number[];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly result: IExecutionResult;
    public readonly totals?: DataValue[][][];
    public readonly totalTotals?: DataValue[][][];
    public readonly warnings?: IResultWarning[];
    private readonly _fingerprint: string;

    constructor(result: IExecutionResult, dataResult: GdcExecution.IExecutionResult) {
        this.result = result;
        this.definition = result.definition;
        this.data = dataResult.data;
        this.headerItems = dataResult.headerItems ? dataResult.headerItems : [];
        this.totals = dataResult.totals;
        this.totalTotals = dataResult.totalTotals;
        this.totalCount = dataResult.paging.total;
        this.count = dataResult.paging.count;
        this.offset = dataResult.paging.offset;
        this.warnings = dataResult.warnings?.map(convertWarning) ?? [];

        this._fingerprint = `${result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;

        this.headerItems = preprocessTotalHeaderItems(this.headerItems, this.definition);
        this.headerItems = transformResultHeaders(
            this.headerItems,
            createResultHeaderTransformer(findDateAttributeUris(result.dimensions)),
            this.definition.postProcessing,
        );
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    public equals(other: IDataView): boolean {
        return this.fingerprint() === other.fingerprint();
    }
}

//
//
//

function hasEmptyData(result: GdcExecution.IExecutionResult): boolean {
    return result.data.length === 0;
}

function hasMissingHeaderItems(result: GdcExecution.IExecutionResult): boolean {
    return !result.headerItems;
}

function isEmptyDataResult(result: GdcExecution.IExecutionResult): boolean {
    return hasEmptyData(result) && hasMissingHeaderItems(result);
}
