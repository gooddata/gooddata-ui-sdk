// (C) 2019-2020 GoodData Corporation
import { DataValue, IResultHeader } from "@gooddata/sdk-backend-spi";
import { Execution } from "@gooddata/gd-tiger-client";
import isResultAttributeHeader = Execution.isResultAttributeHeader;
import isResultMeasureHeader = Execution.isResultMeasureHeader;

export type TransformerResult = {
    readonly headerItems: IResultHeader[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly offset: number[];
    readonly count: number[];
    readonly total: number[];
};

function transformHeaderItems(dimensionHeaders?: Execution.IDimensionHeader[]): IResultHeader[][][] {
    if (!dimensionHeaders) {
        return [[[]]];
    }

    return dimensionHeaders.map(dimensionHeader => {
        return dimensionHeader.headerGroups.map(headerGroup => {
            return headerGroup.headers.map(
                (header): IResultHeader => {
                    if (isResultAttributeHeader(header)) {
                        return {
                            attributeHeaderItem: {
                                uri: `/fake/${header.attributeHeader.labelValue}`,
                                name: header.attributeHeader.labelValue,
                            },
                        };
                    }

                    if (isResultMeasureHeader(header)) {
                        return {
                            measureHeaderItem: {
                                name: header.measureHeader.name,
                                order: header.measureHeader.order,
                            },
                        };
                    }

                    return {
                        totalHeaderItem: {
                            name: header.totalHeader.name,
                            type: header.totalHeader.type,
                        },
                    };
                },
            );
        });
    });
}

export function transformExecutionResult(result: Execution.IExecutionResult): TransformerResult {
    return {
        data: result.data,
        headerItems: transformHeaderItems(result.dimensionHeaders),
        offset: result.paging.offset,
        count: result.paging.count,
        total: result.paging.total,
    };
}
