// (C) 2019-2022 GoodData Corporation
import {
    DimensionHeader,
    ExecutionResult,
    ExecutionResultGrandTotal,
    isResultAttributeHeader,
    JsonApiAttributeOutAttributesGranularityEnum,
} from "@gooddata/api-client-tiger";
import {
    DateAttributeGranularity,
    IExecutionDefinition,
    DataValue,
    IMeasureDescriptor,
    IDimensionItemDescriptor,
    IDimensionDescriptor,
    IResultHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";
import { createDateValueFormatter } from "../dateFormatting/dateValueFormatter";
import { DateFormatter } from "../dateFormatting/types";
import { toSdkGranularity } from "../dateGranularityConversions";
import { totalLocalIdentifier, withTotals } from "../../toBackend/afm/TotalsConverter";
import isEmpty from "lodash/isEmpty";

export type Data = DataValue[] | DataValue[][];

export type TransformerResult = {
    readonly headerItems: IResultHeader[][][];
    readonly data: Data;
    readonly offset: number[];
    readonly count: number[];
    readonly total: number[];
};

// gets all the enum values
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
            return headerGroup.headers.map((header): IResultHeader => {
                if (isResultAttributeHeader(header)) {
                    return {
                        attributeHeaderItem: {
                            uri: header.attributeHeader.primaryLabelValue,
                            name: granularity
                                ? dateValueFormatter(header.attributeHeader.labelValue, granularity)
                                : header.attributeHeader.labelValue,
                        },
                    };
                }

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
            });
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
        data: result.data as unknown as Data,
        headerItems: transformHeaderItems(dimensions, dateFormatter, result.dimensionHeaders),
        offset: result.paging.offset,
        count: result.paging.count,
        total: result.paging.total,
    };
}

export function transformGrandTotalData(
    definition: IExecutionDefinition,
    grandTotals: ExecutionResultGrandTotal[],
): DataValue[][][] | undefined {
    if (definition.dimensions.every((dim) => isEmpty(dim.totals))) {
        // SDK cannot work with explicit empty totals, undefined must be returned instead
        return undefined;
    }
    const grandTotalsData: DataValue[][][] = definition.dimensions.map((_) => []);
    const grandTotalsByLocalId = new Map(grandTotals.map((total) => [total.localIdentifier, total.data]));
    withTotals(definition.dimensions, (dimIdx, typeIdx, totalsOfType) => {
        const totalType = totalsOfType[0].type;
        const localId = totalLocalIdentifier(totalType, dimIdx);
        // Tiger API supports multi-dimensional totals but SDK limits to single dim totals only
        grandTotalsData[dimIdx][typeIdx] = grandTotalsByLocalId.get(localId) as Array<DataValue>;
    });
    return grandTotalsData;
}
