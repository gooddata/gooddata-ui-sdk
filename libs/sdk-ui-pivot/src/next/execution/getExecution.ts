// (C) 2025 GoodData Corporation
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IAnalyticalBackend, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { IAttribute, IFilter, IMeasure, ISortItem, newBucket } from "@gooddata/sdk-model";
import { COLUMNS_PER_PAGE } from "../constants/internal.js";
import { MeasureGroupDimension } from "../types/public.js";

/**
 * @internal
 */
export interface IGetExecutionParams {
    backend: IAnalyticalBackend;
    workspace: string;
    columns: IAttribute[];
    rows: IAttribute[];
    measures: IMeasure[];
    filters: IFilter[];
    sortBy: ISortItem[];
    measureGroupDimension: MeasureGroupDimension;
}

/**
 * @internal
 */
export interface IGetExecutionDataViewParams {
    executionResult: IExecutionResult;
    startRow: number;
    endRow: number;
}

/**
 * @internal
 */
export interface IGetFullExecutionDataViewParams {
    executionResult: IExecutionResult;
}

/**
 * @internal
 */
export function getDimensions(
    rows: IAttribute[],
    columns: IAttribute[],
    measures: IMeasure[],
    measureGroupDimension: MeasureGroupDimension,
) {
    const dimensions = [
        {
            itemIdentifiers: [...rows.map((a) => a.attribute.localIdentifier)],
        },
        {
            itemIdentifiers: [...columns.map((a) => a.attribute.localIdentifier)],
        },
    ];

    if (measures.length > 0) {
        if (measureGroupDimension === "columns") {
            dimensions[1].itemIdentifiers.push("measureGroup");
        } else if (measureGroupDimension === "rows") {
            dimensions[0].itemIdentifiers.push("measureGroup");
        }
    }

    return dimensions;
}

/**
 * @internal
 */
export function getExecution({
    backend,
    workspace,
    columns,
    rows,
    measures,
    filters,
    sortBy,
    measureGroupDimension,
}: IGetExecutionParams) {
    const dimensions = getDimensions(rows, columns, measures, measureGroupDimension);
    const attributes = rows.concat(columns);

    // TODO: handle totals
    const buckets = [
        newBucket(BucketNames.MEASURES, ...measures),
        newBucket(BucketNames.ATTRIBUTE, ...rows),
        newBucket(BucketNames.COLUMNS, ...columns),
    ];

    return backend.workspace(workspace).execution().forDefinition({
        workspace,
        attributes,
        measures,
        dimensions,
        filters,
        buckets,
        sortBy,
        // TODO: if this is missing, it's causing recordings not matching
        postProcessing: {},
    });
}

/**
 * @internal
 */
export async function getPaginatedExecutionDataView({
    executionResult,
    startRow,
    endRow,
}: IGetExecutionDataViewParams) {
    const result = await executionResult.readWindow([startRow, 0], [endRow - startRow, COLUMNS_PER_PAGE]);

    return DataViewFacade.for(result);
}

/**
 * @internal
 */
export async function getFullExecutionDataView({ executionResult }: IGetExecutionDataViewParams) {
    const result = await executionResult.readAll();

    return DataViewFacade.for(result);
}
