// (C) 2007-2022 GoodData Corporation
import head from "lodash/head";
import isEmpty from "lodash/isEmpty";

import { isAreaChart, isOneOfTypes, isTreemap } from "../chartTypes/_util/common";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { supportedDualAxesChartTypes } from "../chartTypes/_chartOptions/chartCapabilities";
import { ISeriesItem, IChartOptions } from "../typings/unsafe";

export const RESPONSIVE_ITEM_MIN_WIDTH = 200;
export const RESPONSIVE_VISIBLE_ROWS = 2;
export const FLUID_PAGING_WIDTH = 30;
export const LEGEND_PADDING = 12;
export const ITEM_HEIGHT = 20;
export const SKIPPED_LABEL_TEXT = "...";
export const UTF_NON_BREAKING_SPACE = "\u00A0";
const STATIC_PAGING_HEIGHT = 44;

export function calculateFluidLegend(
    seriesCount: number,
    containerWidth: number,
): {
    hasPaging: boolean;
    itemWidth: number;
    visibleItemsCount: number;
} {
    // -1 because flex dimensions provide rounded number and the real width can be float
    const realWidth = containerWidth - 2 * LEGEND_PADDING - 1;

    if (seriesCount <= 2) {
        return {
            hasPaging: false,
            itemWidth: realWidth / seriesCount,
            visibleItemsCount: seriesCount,
        };
    }

    let columnsCount = Math.floor(realWidth / RESPONSIVE_ITEM_MIN_WIDTH);
    let itemWidth = realWidth / columnsCount;
    let hasPaging = false;

    const rowsCount = Math.ceil(seriesCount / columnsCount);

    // Recalculate with paging
    if (rowsCount > RESPONSIVE_VISIBLE_ROWS) {
        const legendWidthWithPaging = realWidth - FLUID_PAGING_WIDTH;
        columnsCount = Math.floor(legendWidthWithPaging / RESPONSIVE_ITEM_MIN_WIDTH);
        itemWidth = legendWidthWithPaging / columnsCount;
        hasPaging = true;
    }

    const visibleItemsCount = columnsCount * RESPONSIVE_VISIBLE_ROWS;

    return {
        itemWidth,
        hasPaging,
        visibleItemsCount,
    };
}

function getStaticVisibleItemsCount(containerHeight: number, withPaging: boolean = false) {
    const pagingHeight = withPaging ? STATIC_PAGING_HEIGHT : 0;
    return Math.floor((containerHeight - pagingHeight) / ITEM_HEIGHT);
}

export function calculateStaticLegend(
    seriesCount: number,
    containerHeight: number,
): {
    hasPaging: boolean;
    visibleItemsCount: number;
} {
    const visibleItemsCount = getStaticVisibleItemsCount(containerHeight);
    if (visibleItemsCount >= seriesCount) {
        return {
            hasPaging: false,
            visibleItemsCount,
        };
    }
    return {
        hasPaging: true,
        visibleItemsCount: getStaticVisibleItemsCount(containerHeight, true),
    };
}

const LEGEND_TEXT_KEYS = {
    column: ["left", "right"],
    line: ["left", "right"],
    bar: ["bottom", "top"],
    area: ["left", "right"],
    combo: ["left", "right"],
    combo2: ["left", "right"],
};

export const LEGEND_AXIS_INDICATOR = "legendAxisIndicator";
export const LEGEND_SEPARATOR = "legendSeparator";

function separateLegendItems(series: any[]) {
    return series.reduce(
        (result: any, item: any) => {
            // for now, it assumes that GDC chart only has 2 Y axes in maximum
            // yAxis only takes 0 (left/bottom axis) or 1 (right/top axis)
            const { yAxis } = item;
            if (!yAxis) {
                // 0
                result.itemsOnFirstAxis.push(item);
            } else {
                result.itemsOnSecondAxis.push(item);
            }
            return result;
        },
        {
            itemsOnFirstAxis: [],
            itemsOnSecondAxis: [],
        },
    );
}

export function groupSeriesItemsByType(series: ISeriesItem[]): { [key: string]: ISeriesItem[] } {
    const primaryType = head(series)?.type;

    return series.reduce(
        (result: Record<string, ISeriesItem[]>, item: ISeriesItem) => {
            if (primaryType === item.type) {
                result.primaryItems.push(item);
            } else {
                result.secondaryItems.push(item);
            }

            return result;
        },
        {
            primaryItems: [],
            secondaryItems: [],
        },
    );
}

export function getComboChartSeries(series: any[]): any[] {
    const { primaryItems, secondaryItems } = groupSeriesItemsByType(series);
    const primaryItem: ISeriesItem = head(primaryItems) || {};
    const secondaryItem: ISeriesItem = head(secondaryItems) || {};
    const primaryType: string = primaryItem.type || VisualizationTypes.COLUMN;
    const secondaryType: string = secondaryItem.type || VisualizationTypes.LINE;
    const [firstAxisKey, secondAxisKey] = LEGEND_TEXT_KEYS.combo;

    // convert to dual axis series when there is only one chart type
    if (isEmpty(secondaryItems)) {
        return transformToDualAxesSeries(series, primaryType);
    }

    // all measures display on same axis
    if (primaryItem.yAxis === secondaryItem.yAxis) {
        return [
            { type: LEGEND_AXIS_INDICATOR, labelKey: primaryType },
            ...primaryItems,
            { type: LEGEND_SEPARATOR },
            { type: LEGEND_AXIS_INDICATOR, labelKey: secondaryType },
            ...secondaryItems,
        ];
    }

    return [
        {
            type: LEGEND_AXIS_INDICATOR,
            labelKey: VisualizationTypes.COMBO,
            data: [primaryType, firstAxisKey],
        },
        ...primaryItems,
        { type: LEGEND_SEPARATOR },
        {
            type: LEGEND_AXIS_INDICATOR,
            labelKey: VisualizationTypes.COMBO,
            data: [secondaryType, secondAxisKey],
        },
        ...secondaryItems,
    ];
}

export function createDualAxesSeriesMapper(chartType: string) {
    return (series: any[]): any[] => {
        return transformToDualAxesSeries(series, chartType);
    };
}

export function transformToDualAxesSeries(series: any[], chartType: string): any[] {
    const { itemsOnFirstAxis, itemsOnSecondAxis } = separateLegendItems(series);

    if (
        !isOneOfTypes(chartType, supportedDualAxesChartTypes) ||
        !itemsOnFirstAxis.length ||
        !itemsOnSecondAxis.length
    ) {
        return series;
    }

    const [firstAxisKey, secondAxisKey] = LEGEND_TEXT_KEYS[chartType];

    return [
        { type: LEGEND_AXIS_INDICATOR, labelKey: firstAxisKey },
        ...itemsOnFirstAxis,
        { type: LEGEND_SEPARATOR },
        { type: LEGEND_AXIS_INDICATOR, labelKey: secondAxisKey },
        ...itemsOnSecondAxis,
    ];
}

export function isStackedChart(chartOptions: IChartOptions): boolean {
    const seriesLength = chartOptions?.data?.series?.length;
    const { type, stacking, hasStackByAttribute } = chartOptions;
    const hasMoreThanOneSeries = seriesLength > 1;
    const isAreaChartWithOneSerie = isAreaChart(type) && !hasMoreThanOneSeries && !hasStackByAttribute;
    return !isAreaChartWithOneSerie && !isTreemap(type) && Boolean(stacking);
}
