// (C) 2020 GoodData Corporation
import { DataValue } from "@gooddata/sdk-backend-spi";
import { GdcExecution } from "@gooddata/api-model-bear";
import { IPostProcessing } from "@gooddata/sdk-model";
import { transformDateFormat } from "../../dateFormatting/dateFormatter";

export type TransformedResult = {
    readonly headerItems?: GdcExecution.IResultHeaderItem[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly total: number[];
    readonly offset: number[];
    readonly count: number[];
    readonly totals?: DataValue[][][];
    readonly warnings?: GdcExecution.Warning[];
};

export function transformHeaderItems(
    headerItems?: GdcExecution.IResultHeaderItem[][][],
    postProcessing?: IPostProcessing,
): GdcExecution.IResultHeaderItem[][][] | undefined {
    if (!headerItems || !postProcessing) {
        return headerItems;
    }
    return headerItems.map((headerItems1: GdcExecution.IResultHeaderItem[][]) => {
        return headerItems1.map((headerItems2: GdcExecution.IResultHeaderItem[]) => {
            return headerItems2.map((headerItem: GdcExecution.IResultHeaderItem) => {
                if (postProcessing.dateFormat) {
                    return transformDateFormat(headerItem, postProcessing.dateFormat);
                }
                return headerItem;
            });
        });
    });
}

export function transformExecutionResult(
    result: GdcExecution.IExecutionResult,
    postProcessing?: IPostProcessing,
): TransformedResult {
    return {
        data: result.data,
        headerItems: transformHeaderItems(result.headerItems, postProcessing),
        offset: result.paging.offset,
        count: result.paging.count,
        total: result.paging.total,
    };
}
