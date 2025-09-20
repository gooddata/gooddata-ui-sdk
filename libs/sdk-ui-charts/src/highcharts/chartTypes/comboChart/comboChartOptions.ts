// (C) 2007-2025 GoodData Corporation
import { cloneDeep, set } from "lodash-es";

import {
    IAttributeOrMeasure,
    IBucket,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    isMeasure,
    measureLocalId,
} from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade, VisualizationTypes } from "@gooddata/sdk-ui";

import { IChartConfig } from "../../../interfaces/index.js";
import { StackingType } from "../../constants/stacking.js";
import { ISeriesItem } from "../../typings/unsafe.js";
import { isSolidFill } from "../_chartOptions/patternFillOptions.js";
import { isAreaChart, isLineChart } from "../_util/common.js";

export const CHART_ORDER: Record<string, number> = {
    [VisualizationTypes.AREA]: 1,
    [VisualizationTypes.COLUMN]: 2,
    [VisualizationTypes.LINE]: 3,
};

/**
 * @internal
 */
export const COMBO_SUPPORTED_CHARTS = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
];

const DEFAULT_COMBO_CHART_TYPES = [VisualizationTypes.COLUMN, VisualizationTypes.LINE];

function getMeasureIndices(bucketItems: IAttributeOrMeasure[], measureGroupIdentifiers: string[]): number[] {
    return bucketItems.reduce((result: number[], item: IAttributeOrMeasure) => {
        const localIdentifier = isMeasure(item) ? measureLocalId(item) : "";

        if (localIdentifier) {
            const metricIndex = measureGroupIdentifiers.indexOf(localIdentifier);
            result.push(metricIndex);
        }

        return result;
    }, []);
}

export function getComboChartSeries(
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    series: ISeriesItem[],
    dv: DataViewFacade,
): ISeriesItem[] {
    const updatedSeries = cloneDeep(series);
    const measureBuckets: Record<string, number[]> = {};
    const types = [config.primaryChartType, config.secondaryChartType];
    const measureGroupIdentifiers = measureGroup.items.map(
        (item: IMeasureDescriptor) => item?.measureHeaderItem?.localIdentifier ?? "",
    );

    dv.def()
        .buckets()
        .forEach((bucket: IBucket) => {
            const bucketItems = bucket.items || [];
            measureBuckets[bucket.localIdentifier] = getMeasureIndices(bucketItems, measureGroupIdentifiers);
        });

    [BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES].forEach((name: string, index: number) => {
        (measureBuckets[name] || []).forEach((measureIndex: number) => {
            const chartType: string = CHART_ORDER[types[index]]
                ? types[index]
                : DEFAULT_COMBO_CHART_TYPES[index];

            set(updatedSeries, [measureIndex, "type"], chartType);
            set(updatedSeries, [measureIndex, "zIndex"], CHART_ORDER[chartType]);
        });
    });

    // Enforce solid color for any line series so that chart fill (pattern/outline) does not affect lines
    updatedSeries.forEach((series: ISeriesItem, index: number) => {
        const color = series.color;
        const baseColor: string | undefined =
            series.borderColor ?? (typeof color === "string" ? color : undefined);
        if (isLineChart(series.type)) {
            // For pattern/outline fills, base color is stored in borderColor; fallback to string color if present
            if (baseColor) {
                set(updatedSeries, [index, "color"], baseColor);
            }
        } else if (isAreaChart(series.type) && !isSolidFill(config.chartFill)) {
            set(updatedSeries, [index, "color"], baseColor);
            set(updatedSeries, [index, "fillColor"], color);
            set(updatedSeries, [index, "borderColor"], baseColor);
        }
    });

    return updatedSeries;
}

function isAllSeriesOnLeftAxis(series: ISeriesItem[] = []): boolean {
    return series.every((item) => item.yAxis === 0);
}

function isSomeSeriesWithLineChart(series: ISeriesItem[] = []): boolean {
    return series.some((item) => isLineChart(item.type));
}

export function canComboChartBeStackedInPercent(series: ISeriesItem[]): boolean {
    const isAllSeriesOnLeft = isAllSeriesOnLeftAxis(series);
    const hasLineChartType = isSomeSeriesWithLineChart(series);

    return !(isAllSeriesOnLeft && hasLineChartType);
}

export function getComboChartStackingConfig(
    config: IChartConfig,
    series: ISeriesItem[],
    defaultStacking: StackingType,
): StackingType {
    const { stackMeasures } = config;
    const canStackInPercent = canComboChartBeStackedInPercent(series);

    if (canStackInPercent) {
        return defaultStacking;
    }

    return stackMeasures ? "normal" : null;
}
