// (C) 2019 GoodData Corporation

import { Execution } from "@gooddata/gd-bear-model";
import {
    DataValue,
    DataViewError,
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IDimensionDescriptor,
    IResultHeader,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import SparkMD5 from "spark-md5";
import { AuthenticatedCallGuard } from "./commonTypes";

export class BearExecutionResult implements IExecutionResult {
    public readonly dimensions: IDimensionDescriptor[];
    private readonly _fingerprint: string;

    constructor(
        private readonly authCall: AuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly execFactory: IExecutionFactory,
        private readonly execResponse: Execution.IExecutionResponse,
    ) {
        this.dimensions = execResponse.dimensions;
        this._fingerprint = SparkMD5.hash(execResponse.links.executionResult);
    }

    public async readAll(): Promise<IDataView> {
        return this.asDataView(
            this.authCall(sdk => sdk.execution.getExecutionResult(this.execResponse.links.executionResult)),
        );
    }

    public async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const saneOffset = sanitizeOffset(offset);
        const saneSize = sanitizeSize(size);

        return this.asDataView(
            this.authCall(sdk =>
                sdk.execution.getPartialExecutionResult(
                    this.execResponse.links.executionResult,
                    saneSize,
                    saneOffset,
                ),
            ),
        );
    }

    public transform(): IPreparedExecution {
        return this.execFactory.forDefinition(this.definition);
    }

    public async export(options: IExportConfig): Promise<IExportResult> {
        return this.authCall(sdk =>
            sdk.report.exportResult(
                this.definition.workspace,
                this.execResponse.links.executionResult,
                options,
            ),
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
    public readonly headerItems: IResultHeader[][][];
    public readonly totalCount: number[];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly result: IExecutionResult;
    public readonly totals?: DataValue[][][];
    private readonly _fingerprint: string;

    constructor(result: IExecutionResult, dataResult: Execution.IExecutionResult) {
        this.result = result;
        this.definition = result.definition;
        this.data = dataResult.data;
        this.headerItems = dataResult.headerItems ? dataResult.headerItems : [];
        this.totals = dataResult.totals;
        this.totalCount = dataResult.paging.total;
        this.count = dataResult.paging.count;
        this.offset = dataResult.paging.offset;

        this._fingerprint = `${result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;
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
