// (C) 2025 GoodData Corporation
import { type IBucket, type IDimension, type IExecutionDefinition } from "@gooddata/sdk-model";

/**
 * Tuple of dimensions (rows and columns) for the pivot table.
 *
 * @internal
 */
export type PivotTableDimensions = [rowsDimension: IDimension, columnsDimension: IDimension];

/**
 * Tuple of buckets (measures, rows and columns) for the pivot table.
 *
 * @internal
 */
export type PivotTableBuckets = [measuresBucket: IBucket, rowsBucket: IBucket, columnsBucket: IBucket];

/**
 * Execution definition for the pivot table.
 *
 * @internal
 */
export interface IPivotTableExecutionDefinition extends Omit<IExecutionDefinition, "dimensions" | "buckets"> {
    dimensions: PivotTableDimensions;
    buckets: PivotTableBuckets;
}
