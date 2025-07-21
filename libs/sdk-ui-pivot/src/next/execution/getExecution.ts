// (C) 2025 GoodData Corporation
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IAnalyticalBackend, IExecutionResult } from "@gooddata/sdk-backend-spi";
import { IAttribute, IDimension, IFilter, IMeasure, ISortItem, ITotal, newBucket } from "@gooddata/sdk-model";
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
    totals: ITotal[];
    measureGroupDimension: MeasureGroupDimension;
    signal: AbortSignal;
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

function getDimensions(
    rows: IAttribute[],
    columns: IAttribute[],
    measures: IMeasure[],
    rowTotals: ITotal[],
    columnTotals: ITotal[],
    measureGroupDimension: MeasureGroupDimension,
): IDimension[] {
    const dimensions: IDimension[] = [
        {
            itemIdentifiers: [...rows.map((a) => a.attribute.localIdentifier)],
        },
        {
            itemIdentifiers: [...columns.map((a) => a.attribute.localIdentifier)],
        },
    ];

    if (rowTotals.length > 0) {
        dimensions[0].totals = rowTotals;
    }

    if (columnTotals.length > 0) {
        dimensions[1].totals = columnTotals;
    }

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
export async function getExecution({
    backend,
    workspace,
    columns,
    rows,
    measures,
    filters,
    sortBy,
    totals,
    signal,
    measureGroupDimension,
}: IGetExecutionParams) {
    const rowTotals = totals.filter((total) =>
        rows.find((attr) => attr.attribute.localIdentifier === total.attributeIdentifier),
    );
    const columnTotals = totals.filter((total) =>
        columns.find((attr) => attr.attribute.localIdentifier === total.attributeIdentifier),
    );
    const dimensions = getDimensions(rows, columns, measures, rowTotals, columnTotals, measureGroupDimension);
    const attributes = rows.concat(columns);

    const buckets = [
        newBucket(BucketNames.MEASURES, ...measures),
        newBucket(BucketNames.ATTRIBUTE, ...rows, ...rowTotals),
        newBucket(BucketNames.COLUMNS, ...columns, ...columnTotals),
    ];

    const execution = backend
        .workspace(workspace)
        .execution()
        .forDefinition({
            workspace,
            attributes,
            measures,
            dimensions,
            filters,
            buckets,
            sortBy,
            // TODO: if this is missing, it's causing recordings not matching
            postProcessing: {},
        })
        .withSignal(signal);

    return execution.execute();
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
