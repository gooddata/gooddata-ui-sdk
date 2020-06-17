// (C) 2019-2020 GoodData Corporation
import {
    DataValue,
    IResultHeader,
    IDimensionDescriptor,
    isAttributeDescriptor,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-backend-spi";
import { Execution, AttributeGranularityResourceAttribute } from "@gooddata/gd-tiger-client";
import isResultAttributeHeader = Execution.isResultAttributeHeader;
import isResultMeasureHeader = Execution.isResultMeasureHeader;
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";
import { toSdkGranularity } from "../toSdkModel/dateGranularityConversions";
import { DateFormatter } from "../dateFormatting/types";
import { createDateValueFormatter } from "../dateFormatting/dateValueFormatter";

export type TransformerResult = {
    readonly headerItems: IResultHeader[][][];
    readonly data: DataValue[][] | DataValue[];
    readonly offset: number[];
    readonly count: number[];
    readonly total: number[];
};

// gets all the enum values
const supportedSuffixes: string[] = Object.keys(AttributeGranularityResourceAttribute)
    .filter(item => isNaN(Number(item)))
    .map(
        key =>
            AttributeGranularityResourceAttribute[key as keyof typeof AttributeGranularityResourceAttribute],
    );

function getGranularity(header: IDimensionItemDescriptor): CatalogDateAttributeGranularity | undefined {
    if (!isAttributeDescriptor(header)) {
        return undefined;
    }

    const { identifier } = header.attributeHeader.formOf;
    const suffix = identifier.substr(identifier.lastIndexOf(".") + 1);

    return supportedSuffixes.includes(suffix)
        ? toSdkGranularity(suffix as AttributeGranularityResourceAttribute)
        : undefined; // not a date attribute
}

function getMeasuresFromDimensions(dimensions: IDimensionDescriptor[]): IMeasureDescriptor[] {
    for (const dim of dimensions) {
        const measureGroup = dim.headers.find(isMeasureGroupDescriptor);

        if (measureGroup) {
            return measureGroup.measureGroupHeader.items;
        }
    }

    return [];
}

function transformHeaderItems(
    dimensions: IDimensionDescriptor[],
    dateFormatter: DateFormatter,
    dimensionHeaders?: Execution.IDimensionHeader[],
): IResultHeader[][][] {
    if (!dimensionHeaders) {
        return [[[]]];
    }

    const measureDescriptors = getMeasuresFromDimensions(dimensions);
    const dateValueFormatter = createDateValueFormatter(dateFormatter);

    return dimensionHeaders.map((dimensionHeader, dimensionIndex) => {
        return dimensionHeader.headerGroups.map((headerGroup, headerGroupIndex) => {
            const granularity = getGranularity(dimensions[dimensionIndex].headers[headerGroupIndex]);
            return headerGroup.headers.map(
                (header): IResultHeader => {
                    if (isResultAttributeHeader(header)) {
                        const primaryLabel =
                            header.attributeHeader.primaryLabelValue ?? header.attributeHeader.labelValue;

                        return {
                            attributeHeaderItem: {
                                uri: `/obj/${headerGroupIndex}/elements?id=${primaryLabel}`,
                                name: granularity
                                    ? dateValueFormatter(header.attributeHeader.labelValue, granularity)
                                    : header.attributeHeader.labelValue,
                            },
                        };
                    }

                    if (isResultMeasureHeader(header)) {
                        /*
                         * Tiger sends just the measure index in the measure headers. This is the index of the
                         * measure descriptor within the measure group.
                         */
                        const measureIndex = header.measureHeader.measureIndex;

                        return {
                            measureHeaderItem: {
                                name: measureDescriptors[measureIndex]?.measureHeaderItem.name,
                                order: measureIndex,
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

export function transformExecutionResult(
    result: Execution.IExecutionResult,
    dimensions: IDimensionDescriptor[],
    dateFormatter: DateFormatter,
): TransformerResult {
    return {
        data: result.data,
        headerItems: transformHeaderItems(dimensions, dateFormatter, result.dimensionHeaders),
        offset: result.paging.offset,
        count: result.paging.count,
        total: result.paging.total,
    };
}
