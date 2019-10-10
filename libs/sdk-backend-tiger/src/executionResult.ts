// (C) 2019 GoodData Corporation

import {
    DataValue,
    DataViewError,
    IDataView,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IResultDimension,
    IResultHeaderItem,
    NotImplemented,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { AxiosInstance } from "axios";
import SparkMD5 from "spark-md5";
import { transformResultDimensions } from "./fromAfm/dimensions";
import { transformExecutionResult } from "./fromAfm/result";
import { executionResult } from "./gd-tiger-client/execution";
import { Execution } from "./gd-tiger-model/Execution";
import { IExecutionDefinition } from "@gooddata/sdk-model";

export class TigerExecutionResult implements IExecutionResult {
    public readonly dimensions: IResultDimension[];
    private readonly resultId: string;
    private readonly _fingerprint: string;

    constructor(
        private readonly axios: AxiosInstance,
        public readonly definition: IExecutionDefinition,
        readonly execResponse: Execution.IExecutionResponse,
    ) {
        this.dimensions = transformResultDimensions(execResponse.executionResponse.dimensions);
        this.resultId = execResponse.executionResponse.links.executionResult;
        this._fingerprint = SparkMD5.hash(this.resultId);
    }

    public async readAll(): Promise<IDataView> {
        return this.asDataView(executionResult(this.axios, this.resultId));
    }

    public async readWindow(_offset: number[], _size: number[]): Promise<IDataView> {
        return new Promise((_, reject) => {
            reject(new NotSupported("Tiger backend does not support paging"));
        });
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
        return promisedRes
            .then(res => {
                if (!res) {
                    throw new DataViewError(
                        "An error has occurred while trying to obtain data view for result",
                    );
                }

                return new TigerDataView(this, res);
            })
            .catch(e => {
                throw new DataViewError(
                    "An error has occurred while trying to obtain data view for result",
                    e,
                );
            });
    };
}

/*
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
 */

type DataViewFactory = (promisedRes: Promise<Execution.IExecutionResult | null>) => Promise<IDataView>;

class TigerDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly definition: IExecutionDefinition;
    public readonly headerItems: IResultHeaderItem[][][];
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
        // TODO: this is ok for now when tiger can only return all data and does not allow paging through
        //  results. the count is equal to totalCount.
        this.totalCount = transfomedResult.count;

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
