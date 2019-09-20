// (C) 2019 GoodData Corporation

import {
    DataValue,
    DataViewError,
    IDataView,
    IExecutionDefinition,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IResultDimension,
    IResultHeaderItem,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { Execution } from "@gooddata/gd-bear-model";
import SparkMD5 from "spark-md5";

export class BearExecutionResult implements IExecutionResult {
    public readonly dimensions: IResultDimension[];
    private readonly _fingerprint: string;

    constructor(
        private readonly authSdk: AuthenticatedSdkProvider,
        public readonly definition: IExecutionDefinition,
        private readonly execResponse: Execution.IExecutionResponse,
    ) {
        this.dimensions = execResponse.dimensions;
        this._fingerprint = SparkMD5.hash(execResponse.links.executionResult);
    }

    public async readAll(): Promise<IDataView> {
        const sdk = await this.authSdk();

        return this.asDataView(sdk.execution.getExecutionResult(this.execResponse.links.executionResult));
    }

    public async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const saneOffset = sanitizeOffset(offset);
        const saneSize = sanitizeSize(size);
        const sdk = await this.authSdk();

        return this.asDataView(
            sdk.execution.getPartialExecutionResult(
                this.execResponse.links.executionResult,
                saneSize,
                saneOffset,
            ),
        );
    }

    public transform(): IPreparedExecution {
        throw new NotImplemented("not yet implemented");
    }

    public async export(options: IExportConfig): Promise<IExportResult> {
        const sdk = await this.authSdk();

        return sdk.report.exportResult(
            this.definition.workspace,
            this.execResponse.links.executionResult,
            options,
        );
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

                // TODO: SDK8: enable empty result checking? moved this here from helpers, it was used in vis loading HOC
                // const result = checkEmptyResult(res);

                return new BearDataView(this, res);
            })
            .catch(e => {
                throw new DataViewError(
                    "An error has occurred while trying to obtain data view for result",
                    e,
                );
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
            // tslint:disable-next-line:no-console
            console.warn("The maximum limit per page is " + BEAR_PAGE_SIZE_LIMIT);

            return BEAR_PAGE_SIZE_LIMIT;
        }
        return sizeInDim;
    });
}

type DataViewFactory = (promisedRes: Promise<Execution.IExecutionResult | null>) => Promise<IDataView>;

class BearDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly definition: IExecutionDefinition;
    public readonly headerItems: IResultHeaderItem[][][];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly result: IExecutionResult;
    public readonly totals: DataValue[][][];
    private readonly _fingerprint: string;

    constructor(result: IExecutionResult, dataResult: Execution.IExecutionResult) {
        this.result = result;
        this.definition = result.definition;
        this.data = dataResult.data;
        this.headerItems = dataResult.headerItems ? dataResult.headerItems : [[[]]];
        this.totals = dataResult.totals ? dataResult.totals : [[[]]];
        this.count = dataResult.paging.count;
        this.offset = dataResult.paging.offset;

        this._fingerprint = `${result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;
    }

    public advance(..._dims: number[]): Promise<IDataView | null> {
        throw new NotImplemented("not yet implemented");
    }

    public pageDown(): Promise<IDataView | null> {
        throw new NotImplemented("not yet implemented");
    }

    public pageLeft(): Promise<IDataView | null> {
        throw new NotImplemented("not yet implemented");
    }

    public pageRight(): Promise<IDataView | null> {
        throw new NotImplemented("not yet implemented");
    }

    public pageUp(): Promise<IDataView | null> {
        throw new NotImplemented("not yet implemented");
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

function hasEmptyData(result: Execution.IExecutionResult): boolean {
    return result.data.length === 0;
}

function hasMissingHeaderItems(result: Execution.IExecutionResult): boolean {
    return !result.headerItems;
}

function isEmptyDataResult(result: Execution.IExecutionResult): boolean {
    return hasEmptyData(result) && hasMissingHeaderItems(result);
}

// @ts-ignore
function checkEmptyResult(result: Execution.IExecutionResult) {
    if (isEmptyDataResult(result)) {
        throw {
            name: "EmptyResultError",
            response: {
                status: 204,
                json: () => Promise.resolve(null),
                text: () => Promise.resolve(null),
            },
        };
    }

    return result;
}
