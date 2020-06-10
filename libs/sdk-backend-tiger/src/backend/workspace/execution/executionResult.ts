// (C) 2019-2020 GoodData Corporation

import {
    DataValue,
    IDataView,
    IDimensionDescriptor,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IResultHeader,
    NoDataError,
    NotImplemented,
    NotSupported,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import SparkMD5 from "spark-md5";
import { transformResultDimensions } from "../../../fromAfm/dimensions";
import { transformExecutionResult } from "../../../fromAfm/result";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { Execution } from "@gooddata/gd-tiger-client";
import { TigerAuthenticatedCallGuard } from "../../../types";

const TIGER_PAGE_SIZE_LIMIT = 1000;

function sanitizeOffset(offset: number[]): number[] {
    return offset.map((offsetItem = 0) => offsetItem);
}

function sanitizeSize(size: number[]): number[] {
    return size.map((sizeInDim = TIGER_PAGE_SIZE_LIMIT) => {
        if (sizeInDim > TIGER_PAGE_SIZE_LIMIT) {
            // tslint:disable-next-line:no-console
            console.warn("The maximum limit per page is " + TIGER_PAGE_SIZE_LIMIT);

            return TIGER_PAGE_SIZE_LIMIT;
        }
        return sizeInDim;
    });
}

export class TigerExecutionResult implements IExecutionResult {
    public readonly dimensions: IDimensionDescriptor[];
    private readonly resultId: string;
    private readonly _fingerprint: string;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        readonly execResponse: Execution.IExecutionResponse,
    ) {
        this.dimensions = transformResultDimensions(execResponse.executionResponse.dimensions);
        this.resultId = execResponse.executionResponse.links.executionResult;
        this._fingerprint = SparkMD5.hash(this.resultId);
    }

    public async readAll(): Promise<IDataView> {
        const executionResultPromise = this.authCall(sdk => sdk.execution.executionResult(this.resultId));

        return this.asDataView(executionResultPromise);
    }

    public async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const saneOffset = sanitizeOffset(offset);
        const saneSize = sanitizeSize(size);

        const executionResultPromise = this.authCall(sdk =>
            sdk.execution.executionResult(this.resultId, saneSize, saneOffset),
        );

        return this.asDataView(executionResultPromise);
    }

    public transform(): IPreparedExecution {
        throw new NotImplemented("not yet implemented");
    }

    public async export(_options: IExportConfig): Promise<IExportResult> {
        return new Promise((_, reject) => {
            reject(new NotSupported("Tiger backend does not support exports"));
        });
    }

    public equals(other: IExecutionResult): boolean {
        return this.fingerprint() === other.fingerprint();
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    private asDataView: DataViewFactory = promisedRes => {
        return promisedRes.then(res => {
            if (!res) {
                // TODO: SDK8: investigate when can this actually happen; perhaps end of data during paging?
                //  perhaps legitimate NoDataCase?
                throw new UnexpectedError("Server returned no data");
            }

            if (isEmptyDataResult(res)) {
                throw new NoDataError(
                    "The execution resulted in no data to display.",
                    new TigerDataView(this, res),
                );
            }

            return new TigerDataView(this, res);
        });
    };
}

type DataViewFactory = (promisedRes: Promise<Execution.IExecutionResult | null>) => Promise<IDataView>;

class TigerDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly definition: IExecutionDefinition;
    public readonly headerItems: IResultHeader[][][];
    public readonly totalCount: number[];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly result: IExecutionResult;
    public readonly totals: DataValue[][][] = [[[]]];
    private readonly _fingerprint: string;

    constructor(result: IExecutionResult, execResult: Execution.IExecutionResult) {
        this.result = result;
        this.definition = result.definition;

        const transfomedResult = transformExecutionResult(execResult);

        this.data = transfomedResult.data;
        this.headerItems = transfomedResult.headerItems;
        this.offset = transfomedResult.offset;
        this.count = transfomedResult.count;
        this.totalCount = transfomedResult.total;

        /*
        this.totals = dataResult.totals ? dataResult.totals : [[[]]];
        this.count = dataResult.paging.count;
        this.offset = dataResult.paging.offset;

        this._fingerprint = `${result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;
        */

        this._fingerprint = `${result.fingerprint()}/*`;
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    public equals(other: IDataView): boolean {
        return this.fingerprint() === other.fingerprint();
    }
}

function hasEmptyData(result: Execution.IExecutionResult): boolean {
    return result.data.length === 0;
}

function hasMissingDimensionHeaders(result: Execution.IExecutionResult): boolean {
    /*
     * messy fix to tiger's afm always returning dimension headers with no content
     */
    const firstDimHeaders = result.dimensionHeaders?.[0]?.headerGroups?.[0]?.headers?.[0];
    const secondDimHeaders = result.dimensionHeaders?.[1]?.headerGroups?.[0]?.headers?.[0];

    return !result.dimensionHeaders || (!firstDimHeaders && !secondDimHeaders);
}

function isEmptyDataResult(result: Execution.IExecutionResult): boolean {
    return hasEmptyData(result) && hasMissingDimensionHeaders(result);
}
