// (C) 2019-2023 GoodData Corporation
import {
    IAttributeOrMeasure,
    IBucket,
    IDimension,
    IInsightDefinition,
    ISortItem,
    IExecutionDefinition,
    DimensionGenerator,
    IInsight,
    INullableFilter,
    IExecutionConfig,
    DataValue,
    IDimensionDescriptor,
    IResultHeader,
    IResultWarning,
} from "@gooddata/sdk-model";
import { IExportConfig, IExportResult, IExportBlobResult } from "./export.js";

/**
 * Execution factory provides several methods to create a prepared execution from different types
 * of inputs.
 *
 * @remarks
 * Note: the execution factory WILL perform extensive input validation to ensure that the created
 * instance of prepared execution is semantically correct.
 *
 * @public
 */
export interface IExecutionFactory {
    /**
     * Prepares a new execution for the provided execution definition.
     *
     * @remarks
     * The contract is that the definition is taken and used in the prepared execution AS IS. Compared
     * to the other convenience methods, this method MUST NOT create prepared executions with automatically
     * generated dimensions.
     *
     * @param def - execution definition
     * @returns new prepared execution
     */
    forDefinition(def: IExecutionDefinition): IPreparedExecution;

    /**
     * Prepares a new execution for a list of attributes and measures, filtered using the
     * provided filters.
     *
     * @remarks
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions created using the {@link @gooddata/sdk-model#defaultDimensionsGenerator}.
     *
     * @param items - list of attributes and measures, must not be empty
     * @param filters - list of filters, may not be provided
     */
    forItems(items: IAttributeOrMeasure[], filters?: INullableFilter[]): IPreparedExecution;

    /**
     * Prepares a new execution for a list of buckets.
     *
     * @remarks
     * Attributes and measures WILL be transferred to the
     * execution in natural order:
     *
     * - Order of items within a bucket is retained in the execution
     * - Items from first bucket appear before items from second bucket
     *
     * Or more specifically, given two buckets with items as [A1, A2, M1] and [A3, M2, M3], the resulting
     * prepared execution WILL have definition with attributes = [A1, A2, A3] and measures = [M1, M2, M3]
     *
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions created using the {@link @gooddata/sdk-model#defaultDimensionsGenerator}.
     *
     * @param buckets - list of buckets with attributes and measures, must be non empty, must have at least one attr or measure
     * @param filters - optional, may not be provided, may contain null or undefined values which must be ignored
     */
    forBuckets(buckets: IBucket[], filters?: INullableFilter[]): IPreparedExecution;

    /**
     * Prepares a new execution for the provided insight.
     *
     * @remarks
     * Buckets with attributes and measures WILL be used
     * to obtain attributes and measures - the behavior WILL be same as in forBuckets() function. Filters, sort by
     * and totals in the insight WILL be included in the prepared execution.
     *
     * Additionally, an optional list of additional filters WILL be merged with the filters already defined in
     * the insight.
     *
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions greated using the {@link @gooddata/sdk-model#defaultDimensionsGenerator}.
     *
     * @param insightDefinition - insight definition to create execution for, must have buckets which must have some attributes or measures in them
     * @param filters - optional, may not be provided, may contain null or undefined values which must be ignored
     */
    forInsight(insightDefinition: IInsightDefinition, filters?: INullableFilter[]): IPreparedExecution;

    /**
     * Prepares new, by-reference execution for an existing insight.
     *
     * @remarks
     * Execution prepared using this method MAY be realized using different backend API than the executions where
     * attributes and measures are provided 'freeform'. In return, this different backend API may provide additional
     * authorization guarantees - for instance the backend MAY only allow end user to execute these stored insights
     * and not do any 'freeform' execution.
     *
     * If the backend does not support execution by reference, then it MUST fall back to freeform execution.
     *
     * The contract is that prepared executions created by this method MUST be executable and MUST come with
     * pre-filled dimensions created using the {@link @gooddata/sdk-model#defaultDimensionsGenerator}.
     *
     * @param insight - saved insight
     * @param filters - optional list of filters to merge with filters already defined in the insight, may contain null or undefined values which must be ignored
     */
    forInsightByRef(insight: IInsight, filters?: INullableFilter[]): IPreparedExecution;
}

/**
 * All supported explain types
 * @internal
 */
export type ExplainType = "MAQL" | "GRPC_MODEL" | "WDF" | "QT" | "QT_SVG" | "OPT_QT" | "OPT_QT_SVG" | "SQL";

/**
 * Config for execution in explain mode
 * @internal
 */
export type ExplainConfig<T extends ExplainType | undefined> = {
    explainType?: T;
};

/**
 * Represents results of explain done with particular definition for provided exaplain type.
 * @see ExplainType
 *
 * @internal
 */
export type IExplainResult = {
    ["MAQL"]: unknown;
    ["GRPC_MODEL"]: unknown;
    ["WDF"]: unknown;
    ["QT"]: unknown;
    ["OPT_QT"]: unknown;
    ["QT_SVG"]: string; //SVG definition
    ["OPT_QT_SVG"]: string; //SVG definition
    ["SQL"]: string;
};

/**
 * Explain provider for download or get data from explain api
 * @internal
 */
export interface IExplainProvider<T extends ExplainType | undefined> {
    download(): Promise<void>;
    data(): Promise<T extends undefined ? void : IExplainResult[NonNullable<T>]>;
}

/**
 * Prepared execution already knows what data to calculate and allows to specify how the data should be
 * sorted and shaped into dimensions.
 *
 * @remarks
 * To this end, it provides several functions to customize sort items and dimensions. The prepared execution
 * is immutable and so all the customization functions WILL result in a new instance of prepared execution.
 *
 * The contract for creating these new instances is that the new prepared execution MUST be created using the
 * execution factory that created current execution.
 *
 * @public
 */
export interface IPreparedExecution {
    /**
     * Definition of the execution accumulated to so far.
     */
    readonly definition: IExecutionDefinition;

    /**
     * Changes sorting of the resulting data. Any sorting settings accumulated so far WILL be wiped out.
     *
     * @param items - items to sort by
     * @returns new execution with the updated sorts
     */
    withSorting(...items: ISortItem[]): IPreparedExecution;

    /**
     * Configures dimensions of the resulting data. Any dimension settings accumulated so far WILL be wiped out.
     *
     * @remarks
     * The realizations of analytical backend MAY impose constraints on the minimum and maximum number of dimensions.
     * This call WILL fail if the input dimensions do not match constraints imposed by the backend.
     *
     * @param dim - dimensions to set
     * @returns new execution with the updated dimensions
     */
    withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution;

    /**
     * Adds the desired date format to the postProcessing of an IPreparedExecution.
     *
     * @param dateFormat - Format to be applied to the dates in an AFM execution response.
     * @returns new execution with the updated postProcessing
     */
    withDateFormat(dateFormat: string): IPreparedExecution;

    /**
     * Starts the execution.
     */
    execute(): Promise<IExecutionResult>;

    /**
     * Starts the execution in explain mode.
     * @internal
     */
    explain<T extends ExplainType | undefined>(
        config: ExplainConfig<T>,
    ): IExplainProvider<typeof config["explainType"]>;

    /**
     * Tests whether this execution and the other execution are the same.
     *
     * @remarks
     * This effectively means that their definitions are deeply equal.
     *
     * If you are only concerned with the equality from the result calculation point of view,
     * consider comparing fingerprints instead.
     *
     * @param other - another execution
     */
    equals(other: IPreparedExecution): boolean;

    /**
     * Fingerprint of this prepared execution.
     *
     * @remarks
     * This is effectively the fingerprint of the execution
     * definition underlying this instance of Prepared Execution.
     */
    fingerprint(): string;

    /**
     * Additional execution configuration
     */

    withExecConfig(config: IExecutionConfig): IPreparedExecution;
}

/**
 * Represents results of execution done with particular definition.
 *
 * @remarks
 * Within the result is the description of the shape of the data and methods to to obtain views on the data.
 *
 * @public
 */
export interface IExecutionResult {
    /**
     * Full definition of execution that yielded this result.
     */
    readonly definition: IExecutionDefinition;

    /**
     * Description of shape of the data.
     */
    readonly dimensions: IDimensionDescriptor[];

    /**
     * Asynchronously reads all data for this result into a single data view.
     *
     * @returns Promise of data view
     */
    readAll(): Promise<IDataView>;

    /**
     * Asynchronously reads a window of data for this result.
     *
     * @remarks
     * The window is specified using
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
     * @remarks
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
     * @param options - customize how the result looks like (format etc.)
     * @returns Promise of export result = uri of file with exported data
     */
    export(options: IExportConfig): Promise<IExportResult>;

    /**
     * Asynchronously exports all data in this result to a blob.
     *
     * Exported file is downloaded and attached as Blob data to the current window instance.
     *
     * @param options - customize how the result looks like (format etc.)
     * @returns promise with object URL pointing to a Blob data of downloaded exported insight
     */
    exportToBlob(options: IExportConfig): Promise<IExportBlobResult>;

    /**
     * Tests if this execution result is same as the other result.
     *
     * @param other - other result
     * @returns true if equal, false if not
     */
    equals(other: IExecutionResult): boolean;

    /**
     * Unique fingerprint of the execution result.
     *
     * @remarks
     * The fingerprint is influenced by both data included in
     * the result and its dimensionality, sorting and totals.
     *
     * Thus, two results with the same data and same execution definition will have the same fingerprint.
     */
    fingerprint(): string;
}

/**
 * A view on the calculated data.
 *
 * @remarks
 *
 * See also the `{@link @gooddata/sdk-ui#DataViewFacade}`. This wrapper on top of this raw IDataView can be used to work
 * with the data in a way more convenient fashion.
 *
 * @public
 */
export interface IDataView {
    /**
     * Coordinates of where this data view starts. One coordinate per result dimension.
     */
    readonly offset: number[];

    /**
     * Count of data in each dimension.
     */
    readonly count: number[];

    /**
     * Total size of data in each dimension.
     */
    readonly totalCount: number[];

    /**
     * Headers are metadata for the data in this view.
     *
     * @remarks
     * There are headers for each dimension and in
     * each dimension headers are further sliced by the attribute or measure or total to which the data
     * belongs.
     *
     * Thus:
     *
     * - Top array contains 0 to N per-dimension arrays, one for each requested dimension (if any)
     * - The per-dimension arrays then contain per-slice array, one for each attribute or measure in the dimension
     * - The per-slice-array then contains the actual result header which includes information such as attribute element
     *   or measure name
     */
    readonly headerItems: IResultHeader[][][];

    /**
     * The calculated data. Dimensionality of the data matches the dimensions requested at execution time.
     */
    readonly data: DataValue[][] | DataValue[];

    /**
     * Grand totals included in this data view.
     *
     * @remarks
     * Grand totals are included for each dimension; within each
     * dimension there is one entry per requested total and for each requested total there are list of values.
     *
     * Thus:
     *
     * - Top array contains 0 to N per-dimension arrays
     * - Each per-dimension array contains one per-total entry for each requested total
     * - Each per-total entry contains array of calculated values, cardinality of this matches the cardinality
     *   of the data in the respective dimension.
     */
    readonly totals?: DataValue[][][];

    /**
     * Totals of grand totals included in this data view.
     */
    readonly totalTotals?: DataValue[][][];

    /**
     * Full definition of execution that computed data included in this DataView.
     */
    readonly definition: IExecutionDefinition;

    /**
     * Result of the execution that calculated data for this view.
     */
    readonly result: IExecutionResult;

    /**
     * Result warnings.
     *
     * @remarks
     * Backend MAY return warnings to indicate that the result is different compared to what the caller can expect.
     * For example, the caller executes a definition with particular filter,
     * but the backend determines that the filter has no effect on the computation.
     * Backend runs the execution and communicates by warning that the filter was useless.
     */
    readonly warnings?: IResultWarning[];

    /**
     * Tests if this data view is same as the other data view.
     *
     * @param other - other data view
     * @returns true if equal, false if not
     */
    equals(other: IDataView): boolean;

    /**
     * Unique fingerprint of this data view.
     *
     * @remarks
     * The fingerprint is influenced by the execution result and the
     * offset and limit of the data view.
     *
     * Thus, two data views on the same result, with same offset and limit will have the same fingerprint.
     */
    fingerprint(): string;
}
