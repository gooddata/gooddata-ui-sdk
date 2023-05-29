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

import { IChartConfig } from "../../../interfaces";
import { ISeriesItem } from "../../typings/unsafe";

export function buildWaterfallChartSeries(
    series: ISeriesItem[],
    chartConfig: IChartConfig,
    colorAssignment: IColorAssignment,
    colorPalette: IColorPalette,
    emptyHeaderTitle: string,
): ISeriesItem[] {
    const isTotalSeriesEnabled = chartConfig.total?.enabled ?? true;
    if (!isTotalSeriesEnabled || !series || series.length === 0) {
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
    const isTotalEnabled = chartConfig.total?.enabled ?? true;
    const hasPositiveValues = series[0].data.some((item) => item.y > 0);
    const hasNegativeValues = series[0].data.some((item) => item.y < 0);
    const newColorAssignment = colorAssignments.filter((color) =>
        isColorHeaderItemVisible(color, isTotalEnabled, hasPositiveValues, hasNegativeValues),
    );

    return newColorAssignment.map((color: IColorAssignment) => {
        const colorHeaderItem = (color.headerItem as IColorDescriptor)?.colorHeaderItem;
        const totalName = chartConfig.total?.name;
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
