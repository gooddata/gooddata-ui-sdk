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
import { IExportConfig, IExportResult } from "../export";
import { DataValue, IResultDimension, IResultHeaderItem } from "./results";

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
export interface IPreparedExecution extends IExecutionDefinition {
    /**
     * Fingerprint of this prepared execution. Each unique combination of prepared execution attributes
     * results in an unique fingerprint - a perfect hash.
     */
    readonly fingerprint: string;

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
export interface IExecutionDefinition {
    readonly workspace: string;
    readonly buckets: IBucket[];
    readonly attributes: IAttribute[];
    readonly measures: IMeasure[];
    readonly filters: IFilter[];
    readonly sortBy: SortItem[];
    readonly dimensions: IDimension[];
    readonly totals: Total[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IExecutionResult {
    /**
     * Unique fingerprint of the execution result. The fingerprint is influenced by both data included in
     * the result and its dimensionality, sorting and totals.
     *
     * Thus, two results with the same data and same execution definition will have the same fingerprint.
     */
    readonly fingerprint: string;
    readonly dimensions: IResultDimension[];
    readonly executionDefinition: IExecutionDefinition;

    /**
     * Asynchronously reads all data for this result into a single data view.
     *
     * @returns Promise of data view
     */
    readAll(): Promise<IDataView>;

    /**
     * Asynchronously reads a window of data for this result. The window is specified using
     * offset array and size array. The offsets specify coordinates where the view starts and
     * are zero-based. The sizes specify size of the window in each of the results dimension.
     *
     *
     * @param offset - coordinates where the window starts
     * @param size - size of the window in each of the dimensions
     * @returns Promise of data view
     */
    readWindow(offset: number[], size: number[]): Promise<IDataView>;

    /**
     * Transforms this execution result - changing the result sorting, dimensionality and available
     * totals is possible through transformation.
     *
     * It is strongly encouraged to use this function every time when data SHOULD remain the same and just
     * its sorting or dimensionality or totals MUST change. That is because since this intent of the caller
     * is known, the function can apply additional optimizations and obtain the updated result faster
     * compared to fully running the execution.
     *
     * Whether the reuse of the computed result actually happens depends on couple of factors:
     *
     * - Transformation is eligible: adding new native totals (roll-ups) necessitates full re-execution;
     *   all other types of changes (including adding other types of totals) are eligible for execution result reuse.
     *
     * - Backend capabilities: backend MAY NOT be able to natively reuse existing execution result. This is
     *   communicated by the canTransformExistingResult indicator.
     *
     * If the transformation is not eligible for result reuse or the backend is not capable of this optimization, then
     * a new execution WILL be done completely transparently for the caller.
     *
     * @returns new prepared execution with no sorts, dimensions or totals
     */
    transform(): IPreparedExecution;

    /**
     * Asynchronously exports all data in this result.
     *
     * @param options - customize how the result looks like (format etc)
     * @returns Promise of export result = uri of file with exported data
     */
    export(options: IExportConfig): Promise<IExportResult>;

    /**
     * Tests if this execution result is same as the other result.
     *
     * @param other - other result
     * @returns true if equal, false if not
     */
    equals(other: IExecutionResult): boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IDataView {
    /**
     * Unique fingerprint of this data view - the fingerprint is influenced by the execution result and the
     * offset and limit of the data view.
     *
     * Thus, two data views on the same result, with same offset and limit will have the same fingerprint.
     */
    readonly fingerprint: string;

    readonly offset: number[];
    readonly limit: number[];
    readonly headerItems: IResultHeaderItem[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly totals?: DataValue[][][];

    readonly executionDefinition: IExecutionDefinition;
    readonly fromResult: IExecutionResult;

    /**
     * Asynchronously gets data view adjacent to this one in specified dimensions.
     *
     * @param dims - dimensions to advance on. this is an array of length same as the number of dimensions in the
     *        result. the value of the advancement indicates where to move:
     *        less than zero = 0 move back,
     *        0 = do not move,
     *        greater than 0 move forward.
     *        the advancement is done with the limits defined in the current data view.
     *
     * @returns promise of new data view or null if end of data reached
     */
    advance(...dims: number[]): Promise<IDataView | null>;

    /**
     * Convenience method that gets next page of two dimensional result (table).
     *
     * This is same as calling advance(1, 0, 0).
     *
     * @returns promise of new data view or null if end of data reached
     */
    pageUp(): Promise<IDataView | null>;

    /**
     * Convenience method that gets previous page of two dimensional result (table)
     *
     * This is same as calling advance(-1, 0, 0).
     *
     * @returns promise of new data view or null if end of data reached
     */
    pageDown(): Promise<IDataView | null>;

    /**
     * Convenience method that gets page to the left of current page in two dimensional result (table)
     *
     * This is same as calling advance(0, -1, 0).
     *
     * @returns promise of new data view or null if end of data reached
     */
    pageLeft(): Promise<IDataView | null>;

    /**
     * Convenience method that gets page to the right of the current page in two dimensional result (table)
     *
     * This is same as calling advance(0, 1, 0).
     *
     * @returns promise of new data view or null if end of data reached
     */
    pageRight(): Promise<IDataView | null>;

    /**
     * Tests if this data view is same as the other data view.
     *
     * @param other - other data view
     * @returns true if equal, false if not
     */
    equals(other: IDataView): boolean;
}
