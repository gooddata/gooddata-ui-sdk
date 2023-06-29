// (C) 2023 GoodData Corporation
import { IColorAssignment } from "@gooddata/sdk-ui";
import {
    IColorDescriptor,
    IColorPalette,
    IMeasureGroupDescriptor,
    isColorDescriptor,
    isRgbColor,
} from "@gooddata/sdk-model";
import { getColorByGuid, getRgbStringFromRGB } from "@gooddata/sdk-ui-vis-commons";
import findLastIndex from "lodash/findLastIndex.js";

import { IChartConfig, ITotalConfig } from "../../../interfaces/index.js";
import { IPointData, ISeriesDataItem, ISeriesItem } from "../../typings/unsafe.js";
import { unwrap } from "../_util/common.js";
import { getColorOrLegendIndex } from "./waterfallChartsSeries.js";

function isTotalColumnEnabled(chartConfig: IChartConfig): boolean {
    return !hasTotalMeasure(chartConfig) && (chartConfig.total?.enabled ?? true);
}

function hasTotalMeasure(chartConfig: IChartConfig) {
    return chartConfig?.total?.measures?.length > 0;
}

function isMeasureIdATotal(totalConfig: ITotalConfig, measureId: string) {
    const totalMeasures = totalConfig?.measures || [];
    if (totalMeasures.length === 0 || !measureId) {
        return false;
    }
    return totalMeasures.includes(measureId);
}

function getTotalValue(pointDataSet: IPointData[]) {
    const lastTotalIndex = findLastIndex(pointDataSet, (item: IPointData) => item.visible === false);
    let total = 0;

    if (lastTotalIndex + 1 === pointDataSet.length) {
        total = pointDataSet[lastTotalIndex].y;
    } else {
        const startFromIndex = lastTotalIndex + 1;
        for (let i = startFromIndex; i < pointDataSet.length; i += 1) {
            total += pointDataSet[i]?.y || 0;
        }
    }

    return total * -1;
}

export function getTotalColumnColor(colorAssignment: IColorAssignment, colorPalette: IColorPalette) {
    return isRgbColor(colorAssignment.color)
        ? getRgbStringFromRGB(colorAssignment.color.value)
        : getRgbStringFromRGB(getColorByGuid(colorPalette, colorAssignment.color.value, 0));
}

function buildTotalMetricsSeries(
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    series: ISeriesItem[],
    chartConfig: IChartConfig,
    colorAssignment: IColorAssignment,
    colorPalette: IColorPalette,
) {
    const data = series[0].data.reduce((series, seriesDataItem: ISeriesDataItem, pointIndex: number) => {
        const isTotalMeasure = isMeasureIdATotal(
            chartConfig.total,
            unwrap(measureGroup.items[pointIndex])?.localIdentifier,
        );
        if (isTotalMeasure) {
            const legendIndex = getColorOrLegendIndex(seriesDataItem.y, isTotalMeasure);
            const color = getTotalColumnColor(colorAssignment, colorPalette);
            const totalSeriesItem = {
                ...seriesDataItem,
                color,
                borderColor: color,
                legendIndex: legendIndex,
            };
            if (pointIndex > 0) {
                //Adding a shadow column if the series item is a total measure.
                //This shadow column always hidden on the chart
                series.push({
                    ...totalSeriesItem,
                    y: getTotalValue(series),
                    visible: false,
                });
            }
            series.push(totalSeriesItem);
        } else {
            series.push(seriesDataItem);
        }

        return series;
    }, []);

    return [
        {
            ...series[0],
            data,
        },
    ];
}

export function buildWaterfallChartSeries(
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    series: ISeriesItem[],
    chartConfig: IChartConfig,
    colorAssignment: IColorAssignment,
    colorPalette: IColorPalette,
    emptyHeaderTitle: string,
): ISeriesItem[] {
    const isTotalSeriesEnabled = isTotalColumnEnabled(chartConfig);

    if (!isTotalSeriesEnabled || !series || series.length === 0) {
        if (hasTotalMeasure(chartConfig)) {
            return buildTotalMetricsSeries(measureGroup, series, chartConfig, colorAssignment, colorPalette);
        }
        return series;
    }

    const originalSeriesData = series[0].data;
    const color: string = isRgbColor(colorAssignment.color)
        ? getRgbStringFromRGB(colorAssignment.color.value)
        : getRgbStringFromRGB(getColorByGuid(colorPalette, colorAssignment.color.value, 0));

    return [
        {
            ...series[0],
            data: [
                ...originalSeriesData,
                {
                    isSum: true,
                    legendIndex: 0,
                    name: chartConfig.total?.name ?? emptyHeaderTitle,
                    color,
                    format: originalSeriesData[0].format,
                    borderColor: color,
                },
            ],
        },
    ];
}

export function getWaterfallChartCategories(
    categories: string[],
    chartConfig: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    emptyHeaderTitle: string,
): any[] {
    const isTotalSeriesEnabled = chartConfig.total?.enabled ?? true;
    const newCategories =
        categories.length === 0
            ? measureGroup?.items?.map((item) => item.measureHeaderItem.name)
            : [...categories];
    if (isTotalSeriesEnabled) {
        newCategories.push(chartConfig.total?.name ?? emptyHeaderTitle);
    }

    return newCategories;
}

function isColorHeaderItemVisible(
    color: IColorAssignment,
    isTotalEnabled: boolean,
    hasPositiveValues: boolean,
    hasNegativeValues: boolean,
) {
    if (!isColorDescriptor(color.headerItem)) {
        return false;
    }
    const colorItemId = color.headerItem.colorHeaderItem.id;
    return (
        (colorItemId.includes("total") && isTotalEnabled) ||
        (colorItemId.includes("positive") && hasPositiveValues) ||
        (colorItemId.includes("negative") && hasNegativeValues)
    );
}
export function getColorAssignment(
    colorAssignments: IColorAssignment[],
    chartConfig: IChartConfig,
    series: ISeriesItem[],
) {
    const isTotalEnabled = hasTotalMeasure(chartConfig) || isTotalColumnEnabled(chartConfig);
    const hasPositiveValues = series[0].data.some((item) => item.y > 0 && item.legendIndex === 1);
    const hasNegativeValues = series[0].data.some((item) => item.y < 0 && item.legendIndex === 2);
    const newColorAssignment = colorAssignments.filter((color) =>
        isColorHeaderItemVisible(color, isTotalEnabled, hasPositiveValues, hasNegativeValues),
    );

    return newColorAssignment.map((color: IColorAssignment) => {
        const colorHeaderItem = (color.headerItem as IColorDescriptor)?.colorHeaderItem;
        const totalName = hasTotalMeasure(chartConfig) ? null : chartConfig.total?.name;
        if (isTotalEnabled && colorHeaderItem.id.includes("total") && totalName) {
            return {
                ...color,
                headerItem: {
                    colorHeaderItem: {
                        ...colorHeaderItem,
                        name: totalName ?? colorHeaderItem.name,
                    },
                },
            };
        }
        return color;
    });
}
