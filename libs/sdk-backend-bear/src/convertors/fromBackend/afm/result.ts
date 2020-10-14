// (C) 2020 GoodData Corporation
import { DataValue } from "@gooddata/sdk-backend-spi";
import { GdcExecution } from "@gooddata/api-model-bear";
import { DateFormatter } from "../../dateFormatting/types";
import { createDateValueFormatter } from "../../dateFormatting/dateValueFormatter";

export type TransformerResult = {
    readonly headerItems: GdcExecution.IResultHeaderItem[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly total: number[];
    readonly offset: number[];
    readonly count: number[];
    readonly totals?: DataValue[][][];
    readonly warnings?: GdcExecution.Warning[];
};

export function transformHeaderItems(
    dateFormatter: DateFormatter,
    dimensionHeaders?: GdcExecution.IResultHeaderItem[][][],
): GdcExecution.IResultHeaderItem[][][] {
    if (!dimensionHeaders) {
        return [[[]]];
    }
    const dateValueFormatter = createDateValueFormatter(dateFormatter);
    return dimensionHeaders.map((dimHeader1: GdcExecution.IResultHeaderItem[][]) => {
        return dimHeader1.map((dimHeader2: GdcExecution.IResultHeaderItem[]) => {
            return dimHeader2.map((headerItem: GdcExecution.IResultHeaderItem) => {
                if (!GdcExecution.isAttributeHeaderItem(headerItem)) {
                    return headerItem;
                }
                try {
                    return {
                        attributeHeaderItem: {
                            name: dateValueFormatter(headerItem.attributeHeaderItem.name),
                            uri: headerItem.attributeHeaderItem.uri,
                        },
                    };
                } catch {
                    return headerItem;
                }
            });
        });
    });
}

export function transformExecutionResult(
    result: GdcExecution.IExecutionResult,
    dateFormatter: DateFormatter,
): TransformerResult {
    return {
        data: result.data,
        headerItems: transformHeaderItems(dateFormatter, result.headerItems),
        offset: result.paging.offset,
        count: result.paging.count,
        total: result.paging.total,
    };
}
