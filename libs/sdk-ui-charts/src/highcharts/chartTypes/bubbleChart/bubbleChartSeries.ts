// (C) 2020-2025 GoodData Corporation

import { IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { IChartConfig } from "../../../interfaces/index.js";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { ISeriesItemConfig } from "../../typings/unsafe.js";
import { parseValue, unwrap } from "../_util/common.js";

function getCountOfEmptyBuckets(bucketEmptyFlags: boolean[] = []) {
    return bucketEmptyFlags.filter((bucketEmptyFlag) => bucketEmptyFlag).length;
}

function createBubbleDataPoint(
    resData: any,
    emptyBucketsCount: number,
    primaryMeasuresBucketEmpty: boolean,
    secondaryMeasuresBucketEmpty: boolean,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    index: number,
    emptyHeaderTitle: string,
) {
    return {
        x: primaryMeasuresBucketEmpty ? 0 : parseValue(resData[0]),
        y: secondaryMeasuresBucketEmpty ? 0 : parseValue(resData[1 - emptyBucketsCount]),
        // we want to allow NaN on z to be able show bubble of default size when Size bucket is empty
        z: Number(parseFloat(resData[2 - emptyBucketsCount]).toFixed(5)),
        format: unwrap(measureGroup.items.at(-1)).format, // only for dataLabel format
        name: stackByAttribute
            ? valueWithEmptyHandling(
                  getMappingHeaderFormattedName(stackByAttribute.items[index]),
                  emptyHeaderTitle,
              )
            : "",
    };
}

export function getBubbleChartSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    chartConfig?: IChartConfig,
): ISeriesItemConfig[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);
    const useSingleSeries = chartConfig?.enableSingleBubbleSeries ?? false;

    const emptyBucketsCount = getCountOfEmptyBuckets([
        primaryMeasuresBucketEmpty,
        secondaryMeasuresBucketEmpty,
    ]);

    // Single series mode: all data points in one series
    if (useSingleSeries) {
        const dataPoints = dv
            .rawData()
            .twoDimData()
            .map((resData: any, index: number) => {
                return createBubbleDataPoint(
                    resData,
                    emptyBucketsCount,
                    primaryMeasuresBucketEmpty,
                    secondaryMeasuresBucketEmpty,
                    measureGroup,
                    stackByAttribute,
                    index,
                    emptyHeaderTitle,
                );
            })
            .filter((point) => point !== null);

        // Return single series with all data points
        return [
            {
                name: "",
                color: colorStrategy.getColorByIndex(0),
                legendIndex: 0,
                data: dataPoints,
                seriesIndex: 0,
            },
        ];
    }

    // Multiple series mode (default): each data row is a separate series
    let legendIndex = 0;
    let seriesIndex = 0;
    return dv
        .rawData()
        .twoDimData()
        .map((resData: any, index: number) => {
            if (resData[0] === null || resData[1] === null || resData[2] === null) {
                seriesIndex++;
                return null;
            }

            const dataPoint = createBubbleDataPoint(
                resData,
                emptyBucketsCount,
                primaryMeasuresBucketEmpty,
                secondaryMeasuresBucketEmpty,
                measureGroup,
                stackByAttribute,
                index,
                emptyHeaderTitle,
            );

            return {
                name: dataPoint.name,
                color: colorStrategy.getColorByIndex(seriesIndex),
                legendIndex: legendIndex++,
                data: [dataPoint],
                seriesIndex: seriesIndex++,
            };
        })
        .filter((serie) => serie !== null);
}
