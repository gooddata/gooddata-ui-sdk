// (C) 2019-2020 GoodData Corporation
import { DataValue, IResultAttributeHeader, IResultHeader } from "@gooddata/sdk-backend-spi";
import { Execution } from "@gooddata/gd-tiger-client";
import isArray = require("lodash/isArray");
import isAttributeHeaderItem = Execution.isAttributeHeaderItem;

export type TransformerResult = {
    readonly headerItems: IResultHeader[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly offset: number[];
    readonly count: number[];
};

function transformHeaderItems(headerItems?: Execution.IResultHeaderItem[][][]): IResultHeader[][][] {
    if (!headerItems) {
        return [[[]]];
    }

    return headerItems.map(dim => {
        return dim.map(dimHeaders => {
            return dimHeaders.map(
                (headerItem): IResultHeader => {
                    const item = headerItem;

                    if (isAttributeHeaderItem(item)) {
                        const newItem: IResultAttributeHeader = {
                            attributeHeaderItem: {
                                uri: `/fake/${item.attributeHeaderItem.name}`,
                                name: item.attributeHeaderItem.name,
                            },
                        };

                        return newItem;
                    }

                    return item;
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
        headerItems: transformHeaderItems(result.headerItems),
        offset: calculateOffset(result.data),
        count: calculateCount(result.data),
    };
}
