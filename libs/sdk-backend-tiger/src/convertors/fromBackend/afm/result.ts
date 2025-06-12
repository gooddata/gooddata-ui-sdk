// (C) 2019-2022 GoodData Corporation
import { DimensionHeader, ExecutionResult } from "@gooddata/api-client-tiger";
import { DataValue, IResultHeader } from "@gooddata/sdk-model";

export type Data = DataValue[] | DataValue[][];

export type TransformedResult = {
    readonly headerItems: IResultHeader[][][];
    readonly data: Data;
    readonly offset: number[];
    readonly count: number[];
    readonly total: number[];
};

export function transformExecutionResult(
    result: ExecutionResult,
    transformDimensionHeaders: (headers: DimensionHeader[]) => IResultHeader[][][],
): TransformedResult {
    return {
        // in API is data typed as Array<object>
        data: result.data as unknown as Data,
        headerItems: transformDimensionHeaders(result.dimensionHeaders),
        offset: result.paging.offset,
        count: result.paging.count,
        total: result.paging.total,
    };
}
