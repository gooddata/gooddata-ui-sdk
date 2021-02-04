// (C) 2019-2021 GoodData Corporation
import {
    DimensionHeader,
    ExecutionResult,
    isResultAttributeHeader,
    JsonApiAttributeAttributesGranularityEnum,
} from "@gooddata/api-client-tiger";
import {
    DataValue,
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IResultHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-backend-spi";
import { DateAttributeGranularity } from "@gooddata/sdk-model";
import { createDateValueFormatter } from "../dateFormatting/dateValueFormatter";
import { DateFormatter } from "../dateFormatting/types";
import { toSdkGranularity } from "../dateGranularityConversions";

export type Data = DataValue[] | DataValue[][];

export type TransformerResult = {
    readonly headerItems: IResultHeader[][][];
    readonly data: Data;
    readonly offset: number[];
    readonly count: number[];
    readonly total: number[];
};

// gets all the enum values
const supportedSuffixes: string[] = Object.keys(JsonApiAttributeAttributesGranularityEnum)
    .filter((item) => isNaN(Number(item)))
    .map(
        (key) =>
            JsonApiAttributeAttributesGranularityEnum[
                key as keyof typeof JsonApiAttributeAttributesGranularityEnum
            ],
    );

function getGranularity(header: IDimensionItemDescriptor): DateAttributeGranularity | undefined {
    if (!isAttributeDescriptor(header)) {
        return undefined;
    }

    const { identifier } = header.attributeHeader.formOf;
    const suffix = identifier.substr(identifier.lastIndexOf(".") + 1);

    return supportedSuffixes.includes(suffix)
        ? toSdkGranularity(suffix as JsonApiAttributeAttributesGranularityEnum)
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
    dimensionHeaders?: DimensionHeader[],
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
                        /*
                         * Funny stuff #1 - we have to set 'uri' to some made-up value resembling the URIs sent by bear. This
                         * is because pivot table relies on the format of URIs. Ideally we would refactor pivot table to
                         * not care about this however this aspect is like a couple of eggs that hold the pivot spaghetti
                         * together - cannot be easily untangled.
                         */
                        return {
                            attributeHeaderItem: {
                                uri: `/obj/${headerGroupIndex}/elements?id=${header.attributeHeader.primaryLabelValue}`,
                                name: granularity
                                    ? dateValueFormatter(header.attributeHeader.labelValue, granularity)
                                    : header.attributeHeader.labelValue,
                            },
                        };
                    }

                    /*
                     * Funny stuff #2 - Tiger sends just the measure index in the measure headers. This is the index of the
                     * measure descriptor within the measure group. The code looks up the measure descriptor so that
                     * it can then fill in the `name` to the one in the descriptor
                     */
                    const measureIndex = header.measureHeader.measureIndex;

                    return {
                        measureHeaderItem: {
                            name: measureDescriptors[measureIndex]?.measureHeaderItem.name,
                            order: measureIndex,
                        },
                    };
                },
            );
        });
    });
}

export function transformExecutionResult(
    result: ExecutionResult,
    dimensions: IDimensionDescriptor[],
    dateFormatter: DateFormatter,
): TransformerResult {
    return {
        // in API is data typed as Array<object>
        data: (result.data as unknown) as Data,
        headerItems: transformHeaderItems(dimensions, dateFormatter, result.dimensionHeaders),
        offset: result.paging.offset,
        count: result.paging.count,
        total: result.paging.total,
    };
}
