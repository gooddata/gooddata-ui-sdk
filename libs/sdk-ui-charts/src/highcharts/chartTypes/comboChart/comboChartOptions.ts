// (C) 2007-2021 GoodData Corporation
import set from "lodash/set";
import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
import { IMeasureGroupDescriptor, IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { IBucket, IAttributeOrMeasure } from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade, VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../interfaces";
import { isLineChart } from "../_util/common";
import { StackingValues } from "../../constants/stacking";
import { ISeriesItem } from "../../typings/unsafe";

export const CHART_ORDER = {
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
        const localIdentifier = get(item, ["measure", "localIdentifier"], "");

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
    const measureBuckets = {};
    const types = [config.primaryChartType, config.secondaryChartType];
    const measureGroupIdentifiers = measureGroup.items.map((item: IMeasureDescriptor) =>
        get(item, ["measureHeaderItem", "localIdentifier"], ""),
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
    defaultStacking: StackingValues,
): StackingValues {
    const { stackMeasures } = config;
    const canStackInPercent = canComboChartBeStackedInPercent(series);

    if (canStackInPercent) {
        return defaultStacking;
    }

    return stackMeasures ? "normal" : null;
}
