// (C) 2019 GoodData Corporation
import {
    AttributeOrMeasure,
    IAttribute,
    IBucket,
    IDimension,
    IFilter,
    IMeasure,
    SortItem,
    Total,
} from "@gooddata/sdk-model";
import { IResultDimension, IResultHeaderItem, DataValue } from "./results";
import { IExportConfig, IExportResult } from "../export";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExecutionFactory {
    forItems(items: AttributeOrMeasure[], filters?: IFilter): IPreparedExecution;

    forBuckets(buckets: IBucket[], filters?: IFilter): IPreparedExecution;

    forInsight(uri: string, filters?: IFilter): Promise<IPreparedExecution>;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IPreparedExecution {
    /**
     * Fingerprint of this prepared execution. Each unique combination of prepared execution attributes
     * results in an unique fingerprint - a perfect hash.
     */
    readonly fingerprint: string;

    readonly workspace: string;
    readonly attributes: IAttribute[];
    readonly measures: IMeasure[];
    readonly filters: IFilter[];
    readonly sortBy: SortItem[];
    readonly dimensions: IDimension[];
    readonly totals: Total[];

    withSorting(...items: SortItem[]): IPreparedExecution;

    withDimensions(...dim: IDimension[]): IPreparedExecution;

    withTotals(...totals: Total[]): IPreparedExecution;

    execute(): Promise<IExecutionResult>;

    equals(other: IPreparedExecution): boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExecutionResult {
    /**
     * Unique identifier of the execution result.
     */
    readonly id: string;
    readonly dimensions: IResultDimension[];
    readonly forExecution: IPreparedExecution;

    readAll(): Promise<IDataView>;

    readView(offset: number[], limit: number[]): Promise<IDataView>;

    export(options: IExportConfig): Promise<IExportResult>;

    equals(other: IExecutionResult): boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IDataView {
    readonly offset: number[];
    readonly limit: number[];
    readonly headerItems?: IResultHeaderItem[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly totals?: DataValue[][][];

    readonly fromResult: IExecutionResult;
    readonly forExecution: IPreparedExecution;

    next(...dims: boolean[]): Promise<IDataView | null>;

    pageUp(): Promise<IDataView | null>;

    pageDown(): Promise<IDataView | null>;

    pageLeft(): Promise<IDataView | null>;

    pageRight(): Promise<IDataView | null>;
}
