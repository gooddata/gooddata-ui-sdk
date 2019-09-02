// (C) 2019 GoodData Corporation
import {
    AttributeOrMeasureOrTotal,
    IAttribute,
    IBucket,
    IDimension,
    IFilter,
    IMeasure,
    SortItem,
    INativeTotalItem,
    ITotal,
} from "@gooddata/sdk-model";
import { IExecutionResult } from "../result";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExecutionFactory {
    forItems(items: AttributeOrMeasureOrTotal[], filters?: IFilter): IPreparedExecution;

    forBuckets(buckets: IBucket[], filters?: IFilter): IPreparedExecution;

    forInsight(uri: string, filters?: IFilter): Promise<IPreparedExecution>;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IPreparedExecution {
    readonly attributes: IAttribute[];
    readonly measures: IMeasure[];
    readonly filters: IFilter[];
    readonly nativeTotals: INativeTotalItem[];

    sortBy(...items: SortItem[]): IPreparedExecution;

    dimensions(...dim: IDimension[]): IPreparedExecution;

    totals(...totals: ITotal[]): IPreparedExecution;

    execute(): Promise<IExecutionResult>;

    /**
     *
     * // TODO: SDK8: revisit whether this is needed
     *
     * This method exists to ease migration efforts to SDK 8; it will be removed in next major release.
     *
     * @deprecated Migrate your code to fully use IPreparedExecution and the IExecutionResult instead
     */
    asDataSource(): any;
}
