// (C) 2022 GoodData Corporation
import {
    DateAttributeGranularity,
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";
import { DateFormatter } from "../dateFormatting/types";
import {
    AttributeExecutionResultHeader,
    DimensionHeader,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
    JsonApiAttributeOutAttributesGranularityEnum,
    MeasureExecutionResultHeader,
    TotalExecutionResultHeader,
} from "@gooddata/api-client-tiger";
import { createDateValueFormatter } from "../dateFormatting/dateValueFormatter";
import { toSdkGranularity } from "../dateGranularityConversions";

const supportedSuffixes: string[] = Object.keys(JsonApiAttributeOutAttributesGranularityEnum)
    .filter((item) => isNaN(Number(item)))
    .map(
        (key) =>
            JsonApiAttributeOutAttributesGranularityEnum[
                key as keyof typeof JsonApiAttributeOutAttributesGranularityEnum
            ],
    );

function getGranularity(header: IDimensionItemDescriptor): DateAttributeGranularity | undefined {
    if (!isAttributeDescriptor(header)) {
        return undefined;
    }

    const { identifier } = header.attributeHeader.formOf;
    const suffix = identifier.substr(identifier.lastIndexOf(".") + 1);

    return supportedSuffixes.includes(suffix)
        ? toSdkGranularity(suffix as JsonApiAttributeOutAttributesGranularityEnum)
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

export function getTransformDimensionHeaders(
    dimensions: IDimensionDescriptor[],
    dateFormatter: DateFormatter,
): (dimensionHeaders: DimensionHeader[]) => IResultHeader[][][] {
    const measureDescriptors = getMeasuresFromDimensions(dimensions);
    const dateValueFormatter = createDateValueFormatter(dateFormatter);

    return (dimensionHeaders: DimensionHeader[]) =>
        dimensionHeaders.map((dimensionHeader, dimensionIndex) => {
            return dimensionHeader.headerGroups.map((headerGroup, headerGroupIndex) => {
                const granularity = getGranularity(dimensions[dimensionIndex].headers[headerGroupIndex]);
                return headerGroup.headers.map((header): IResultHeader => {
                    if (isResultAttributeHeader(header)) {
                        return attributeMeasureItem(header, granularity, dateValueFormatter);
                    }

                    if (isResultMeasureHeader(header)) {
                        return measureHeaderItem(header, measureDescriptors);
                    }

                    if (isResultTotalHeader(header)) {
                        return totalHeaderItem(header);
                    }

                    // This code should never be reachable
                    throw new Error(`Unexpected type of ResultHeader: ${header}`);
                });
            });
        });
}

function attributeMeasureItem(
    header: AttributeExecutionResultHeader,
    granularity: DateAttributeGranularity | undefined,
    dateValueFormatter: (value: string | null, granularity: DateAttributeGranularity) => string,
): IResultAttributeHeader {
    return {
        attributeHeaderItem: {
            uri: header.attributeHeader.primaryLabelValue,
            name: granularity
                ? dateValueFormatter(header.attributeHeader.labelValue, granularity)
                : header.attributeHeader.labelValue,
        },
    };
}

function measureHeaderItem(
    header: MeasureExecutionResultHeader,
    measureDescriptors: IMeasureDescriptor[],
): IResultMeasureHeader {
    /*
     * Funny stuff #1 - Tiger sends just the measure index in the measure headers. This is the index of the
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
}

function totalHeaderItem(header: TotalExecutionResultHeader): IResultTotalHeader {
    return {
        totalHeaderItem: {
            type: header.totalHeader.function,
            name: header.totalHeader.function.toLowerCase(),
        },
    };
}
