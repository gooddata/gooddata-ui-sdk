// (C) 2022-2025 GoodData Corporation

import {
    type AttributeExecutionResultHeader,
    type DimensionHeader,
    type ExecutionResultGrandTotal,
    type ExecutionResultHeader,
    type JsonApiAttributeOutAttributesGranularityEnum,
    type MeasureExecutionResultHeader,
    type TotalExecutionResultHeader,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
} from "@gooddata/api-client-tiger";
import { type IForecastConfig, type IForecastResult } from "@gooddata/sdk-backend-spi";
import {
    type DateAttributeGranularity,
    type IDimensionDescriptor,
    type IDimensionItemDescriptor,
    type IMeasureDescriptor,
    type IResultAttributeHeader,
    type IResultHeader,
    type IResultMeasureHeader,
    type IResultTotalHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isResultTotalHeader as isResultTotalHeaderModel,
} from "@gooddata/sdk-model";

import {
    createDateValueFormatter,
    createForecastDateValueFormatter,
} from "../dateFormatting/dateValueFormatter.js";
import { createDateValueNormalizer } from "../dateFormatting/dateValueNormalizer.js";
import { type FormattingLocale } from "../dateFormatting/defaultDateFormatter.js";
import { type DateFormatter, type DateNormalizer, type DateParseFormatter } from "../dateFormatting/types.js";
import { toSdkGranularity } from "../dateGranularityConversions.js";

type DateAttributeFormatProps = {
    granularity: DateAttributeGranularity;
    format: {
        locale: FormattingLocale;
        pattern: string;
        timezone?: string;
    };
};

//ivec investigate
const supportedSuffixes: JsonApiAttributeOutAttributesGranularityEnum[] = [
    "MINUTE",
    "HOUR",
    "DAY",
    "WEEK",
    "MONTH",
    "QUARTER",
    "YEAR",
    "MINUTE_OF_HOUR",
    "HOUR_OF_DAY",
    "DAY_OF_WEEK",
    "DAY_OF_MONTH",
    "DAY_OF_QUARTER",
    "DAY_OF_YEAR",
    "WEEK_OF_YEAR",
    "MONTH_OF_YEAR",
    "QUARTER_OF_YEAR",
];

function getDateFormatProps(header: IDimensionItemDescriptor): DateAttributeFormatProps | undefined {
    if (
        !isAttributeDescriptor(header) ||
        !header.attributeHeader.granularity ||
        !supportedSuffixes.includes(
            header.attributeHeader.granularity as JsonApiAttributeOutAttributesGranularityEnum,
        ) ||
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
            timezone: format.timezone,
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
    dateValueNormalizer: DateNormalizer,
    baseHeadersTotalsMap: { [key: number]: TotalExecutionResultHeader },
) {
    if (isResultAttributeHeader(header)) {
        return attributeHeaderItem(header, dateFormatProps, dateValueFormatter, dateValueNormalizer);
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
    const dateValueNormalizer = createDateValueNormalizer();

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
                        dateValueNormalizer,
                        baseHeadersTotalsMap,
                    );
                });

                return [...baseHeaders, ...appendedHeaders];
            });
        });
}

export function getTransformForecastHeaders(
    dimensions: IDimensionDescriptor[],
    dateFormatter: DateFormatter,
    forecastConfig?: IForecastConfig,
): (
    dimensionHeaders: DimensionHeader[],
    forecastResults: IForecastResult | undefined,
) => IResultHeader[][][] {
    if (!forecastConfig) {
        return () => [];
    }

    const dateValueFormatter = createForecastDateValueFormatter(dateFormatter);
    const dateValueNormalizer = createDateValueNormalizer();

    return (dimensionHeaders: DimensionHeader[], forecastResults: IForecastResult | undefined) => {
        let used = false;
        return dimensionHeaders.map((dimensionHeader, dimensionIndex) => {
            return dimensionHeader.headerGroups.map((headerGroup, headerGroupIndex) => {
                const dateFormatProps = getDateFormatProps(
                    dimensions[dimensionIndex].headers[headerGroupIndex],
                );

                if (
                    !used &&
                    headerGroup.headers.length > 1 &&
                    isResultAttributeHeader(headerGroup.headers[0])
                ) {
                    used = true;

                    const data = fillData(forecastResults?.attribute, forecastConfig.forecastPeriod);

                    return data.map((header): IResultAttributeHeader => {
                        return attributeHeaderItem(
                            {
                                attributeHeader: {
                                    labelValue: header as any,
                                    primaryLabelValue: header as any,
                                },
                            },
                            dateFormatProps,
                            dateValueFormatter,
                            dateValueNormalizer,
                        );
                    });
                }

                return [];
            });
        });
    };
}

function attributeHeaderItem(
    header: AttributeExecutionResultHeader,
    dateFormatProps: DateAttributeFormatProps | undefined,
    dateValueFormatter: DateParseFormatter,
    dateValueNormalizer: DateNormalizer,
): IResultAttributeHeader {
    let formattedNameObj = {};

    if (dateFormatProps) {
        const formattedName = dateValueFormatter(
            header.attributeHeader.labelValue,
            dateFormatProps.granularity,
            dateFormatProps.format.locale,
            dateFormatProps.format.pattern,
            dateFormatProps.format.timezone,
        );
        const normalizedValue = dateValueNormalizer(
            header.attributeHeader.labelValue,
            dateFormatProps.granularity,
            dateFormatProps.format.locale,
            dateFormatProps.format.timezone,
        );
        formattedNameObj = {
            formattedName,
            normalizedValue,
        };
    }

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
    const optionalMeasureIndex = measureIndex === undefined ? {} : { measureIndex };
    return {
        totalHeaderItem: {
            type: header.totalHeader.function,
            name: header.totalHeader.function.toLowerCase(),
            ...optionalMeasureIndex,
        },
    };
}

function fillData(items: string[] | undefined, period: number): (string | null)[] {
    if (!items) {
        const emptyData: (string | null)[] = [];
        for (let i = 0; i < period; i++) {
            emptyData.push(null);
        }
        return emptyData;
    }
    return items.slice(items.length - period, items.length);
}
