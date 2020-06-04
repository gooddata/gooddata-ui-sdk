// (C) 2019-2020 GoodData Corporation
import { DataValue, IResultHeader } from "@gooddata/sdk-backend-spi";
import { Execution } from "@gooddata/gd-tiger-client";
import isArray = require("lodash/isArray");
import isResultAttributeHeader = Execution.isResultAttributeHeader;
import isResultMeasureHeader = Execution.isResultMeasureHeader;

export type TransformerResult = {
    readonly headerItems: IResultHeader[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly offset: number[];
    readonly count: number[];
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

function calculateOffset(data: DataValue[][] | DataValue[]): number[] {
    if (!data) {
        return [0];
    }

    return isArray(data[0]) ? [0, 0] : [0];
}

function calculateCount(data: DataValue[][] | DataValue[]): number[] {
    const xCount = data.length;
    const yCount = isArray(data[0]) ? (data[0] as DataValue[]).length : 0;

    return [xCount, yCount];
}

export function transformExecutionResult(result: Execution.IExecutionResult): TransformerResult {
    return {
        data: result.data,
        headerItems: transformHeaderItems(result.dimensionHeaders),
        offset: calculateOffset(result.data),
        count: calculateCount(result.data),
    };
}
