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
    isResultTotalHeader as isResultTotalHeaderModel,
} from "@gooddata/sdk-model";
import { DateFormatter, DateParseFormatter } from "../dateFormatting/types.js";
import {
    AttributeExecutionResultHeader,
    DimensionHeader,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
    JsonApiAttributeOutAttributesGranularityEnum,
    MeasureExecutionResultHeader,
    TotalExecutionResultHeader,
    ExecutionResultGrandTotal,
    ExecutionResultHeader,
} from "@gooddata/api-client-tiger";
import { createDateValueFormatter } from "../dateFormatting/dateValueFormatter.js";
import { toSdkGranularity } from "../dateGranularityConversions.js";
import { FormattingLocale } from "../dateFormatting/defaultDateFormatter.js";

type DateAttributeFormatProps = {
    granularity: DateAttributeGranularity;
    format: {
        locale: FormattingLocale;
        pattern: string;
    };
};

const supportedSuffixes: string[] = Object.keys(JsonApiAttributeOutAttributesGranularityEnum)
    .filter((item) => isNaN(Number(item)))
    .map(
        (key) =>
            JsonApiAttributeOutAttributesGranularityEnum[
                key as keyof typeof JsonApiAttributeOutAttributesGranularityEnum
            ],
    );

function getDateFormatProps(header: IDimensionItemDescriptor): DateAttributeFormatProps | undefined {
    if (
        !isAttributeDescriptor(header) ||
        !header.attributeHeader.granularity ||
        !supportedSuffixes.includes(header.attributeHeader.granularity) ||
        !header.attributeHeader.format
    ) {
        return undefined;
    }

    const {
        attributeHeader: { granularity, format },
    } = header;

    return {
        granularity: toSdkGranularity(granularity as JsonApiAttributeOutAttributesGranularityEnum),
        format: {
            locale: format.locale as FormattingLocale,
            pattern: format.pattern,
        },
    };
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

/**
 * Transform measure headers to total headers, based on the information stored
 * in the indices map which is built on-the fly during the transformation.
 * Ignore attribute headers as they are not relevant for this mapping.
 * When transforming the measure header to a total header, linkage to a measure
 * is preserved with measure index.
 */
function getTransformedTotalHeader(
    header: ExecutionResultHeader,
    headerIndex: number,
    grandColumnTotalsMap: { [key: number]: TotalExecutionResultHeader },
) {
    if (isResultMeasureHeader(header)) {
        if (grandColumnTotalsMap[headerIndex]) {
            const index = header?.measureHeader?.measureIndex;
            return totalHeaderItem(grandColumnTotalsMap[headerIndex], index);
        }

        return totalHeaderItem(grandColumnTotalsMap[headerIndex]);
    } else if (isResultTotalHeader(header)) {
        grandColumnTotalsMap[headerIndex] = header;
        return totalHeaderItem(header);
    }

    return null;
}

/**
 * Transform base header for given index. When transforming measure headers, use
 * built map of indices to transform measure headers to total header items when
 * totals are present. The measure index is stored with total header item
 * for proper numeric formatting etc.
 *
 * On the leaf header item level, we get only measure items and we need to transform them
 * to the total header items. As we come along the totals first when traversing the above
 * levels first, we store indices of these totals  (such as [sum] is on index 2 in the example
 * below, note that for 0 and 1 there will be nothing)
 *
 * | East | East | [sum] | West | West | [sum] |
 * | m1   | m2   | m1    | m1   | m2   | m1    |
 *
 * Then, when processing (leaf) measure items on that index, we flip measure items for total items linked
 * to the particular total
 *
 * | East | East | [sum]      | West | West | [sum]      |
 * | m1   | m2   | [sum - m1] | m1   | m2   | [sum - m1] |
 *
 */
function getTransformedBaseHeader(
    header: ExecutionResultHeader,
    headerGroupIndex: number,
    measureDescriptors: IMeasureDescriptor[],
    dateFormatProps: DateAttributeFormatProps | undefined,
    dateValueFormatter: DateParseFormatter,
    baseHeadersTotalsMap: { [key: number]: TotalExecutionResultHeader },
) {
    if (isResultAttributeHeader(header)) {
        return attributeMeasureItem(header, dateFormatProps, dateValueFormatter);
    }

    if (isResultMeasureHeader(header)) {
        if (baseHeadersTotalsMap[headerGroupIndex]) {
            const index = header?.measureHeader?.measureIndex;
            return totalHeaderItem(baseHeadersTotalsMap[headerGroupIndex], index);
        }

        return measureHeaderItem(header, measureDescriptors);
    }

    if (isResultTotalHeader(header)) {
        baseHeadersTotalsMap[headerGroupIndex] = header;
        return totalHeaderItem(header);
    }

    // This code should never be reachable
    throw new Error(`Unexpected type of ResultHeader: ${header}`);
}

export function getTransformDimensionHeaders(
    dimensions: IDimensionDescriptor[],
    dateFormatter: DateFormatter,
    grandTotals: ExecutionResultGrandTotal[] = [],
): (dimensionHeaders: DimensionHeader[]) => IResultHeader[][][] {
    const measureDescriptors = getMeasuresFromDimensions(dimensions);
    const dateValueFormatter = createDateValueFormatter(dateFormatter);

    const columnGrandTotals = grandTotals.find((total) => total.totalDimensions.includes("dim_0"));
    return (dimensionHeaders: DimensionHeader[]) =>
        dimensionHeaders.map((dimensionHeader, dimensionIndex) => {
            // we need to declare these maps beforehand as they are utilized when processing all header groups
            const baseHeadersTotalsMap: { [key: number]: TotalExecutionResultHeader } = {};
            const grandColumnTotalsMap: { [key: number]: TotalExecutionResultHeader } = {};
            return dimensionHeader.headerGroups.map((headerGroup, headerGroupIndex) => {
                let appendedHeaders: IResultTotalHeader[] = [];
                if (dimensionIndex === 1 && columnGrandTotals) {
                    // Append appropriate column grand total headers to each row. The result is always of type total header.
                    const columnGrandTotalHeaderGroups = columnGrandTotals.dimensionHeaders[0].headerGroups;
                    appendedHeaders = columnGrandTotalHeaderGroups[headerGroupIndex].headers
                        .map((h, headerIndex) =>
                            getTransformedTotalHeader(h, headerIndex, grandColumnTotalsMap),
                        )
                        .filter(isResultTotalHeaderModel);
                }

                const dateFormatProps = getDateFormatProps(
                    dimensions[dimensionIndex].headers[headerGroupIndex],
                );

                const baseHeaders = headerGroup.headers.map((header, index): IResultHeader => {
                    return getTransformedBaseHeader(
                        header,
                        index,
                        measureDescriptors,
                        dateFormatProps,
                        dateValueFormatter,
                        baseHeadersTotalsMap,
                    );
                });

                return [...baseHeaders, ...appendedHeaders];
            });
        });
}

function attributeMeasureItem(
    header: AttributeExecutionResultHeader,
    dateFormatProps: DateAttributeFormatProps | undefined,
    dateValueFormatter: DateParseFormatter,
): IResultAttributeHeader {
    const formattedNameObj = dateFormatProps
        ? {
              formattedName: dateValueFormatter(
                  header.attributeHeader.labelValue,
                  dateFormatProps.granularity,
                  dateFormatProps.format.locale,
                  dateFormatProps.format.pattern,
              ),
          }
        : {};

    return {
        attributeHeaderItem: {
            uri: header.attributeHeader.primaryLabelValue,
            name: header.attributeHeader.labelValue,
            ...formattedNameObj,
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

function totalHeaderItem(header: TotalExecutionResultHeader, measureIndex?: number): IResultTotalHeader {
    const optionalMeasureIndex = measureIndex !== undefined ? { measureIndex } : {};
    return {
        totalHeaderItem: {
            type: header.totalHeader.function,
            name: header.totalHeader.function.toLowerCase(),
            ...optionalMeasureIndex,
        },
    };
}
