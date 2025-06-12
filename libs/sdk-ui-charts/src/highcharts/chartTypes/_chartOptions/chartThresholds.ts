// (C) 2025 GoodData Corporation

// for some reason categories array is not typed in some cases
import { VisType, DataViewFacade } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../interfaces/index.js";
import { ISeriesItem, IZone, ISeriesDataItem } from "../../typings/unsafe.js";
import { isLineChart } from "../_util/common.js";

type DataPoint = number | null | undefined;

const isEmptyDataPoint = (value: DataPoint) => value === undefined || value === null || value === 0;

const getDashStyle = (value: DataPoint) => (isEmptyDataPoint(value) ? "shortDash" : "solid");

export const generateZones = (thresholdSeries: ISeriesDataItem[]): IZone[] => {
    const zones = thresholdSeries.reduce<IZone[]>((zones, { y: value }, i, arr) => {
        if (i > 0) {
            const currentIsEmpty = isEmptyDataPoint(value);
            const previousIsEmpty = isEmptyDataPoint(arr[i - 1].y);
            if (currentIsEmpty && !previousIsEmpty) {
                zones.push({ value: i - 1, dashStyle: "solid" }); // the plot line will be placed at last non-empty point
            }
            if (!currentIsEmpty && previousIsEmpty) {
                zones.push({ value: i, dashStyle: "shortDash" }); // the plot line will be placed at the current non-empty point
            }
        }
        return zones;
    }, []);
    if (zones.length > 0) {
        // add final zone based on the last point value, it has index value to signify it runs to the end
        const dashStyle = getDashStyle(thresholdSeries[thresholdSeries.length - 1].y);
        return [...zones, { dashStyle: dashStyle }];
    } else if (thresholdSeries.length > 0 && thresholdSeries.every((item) => isEmptyDataPoint(item.y))) {
        // Add dashed zone that runs across all series if no zone was created and all points are empty.
        // This is necessary, as the previous reduce algo did not create any zone due to all points being
        // same. The line is solid by default so this must be done only for empty points.
        return [{ dashStyle: "shortDash" }];
    }
    return zones;
};

export const getTrendDividerPlotLines = (thresholdSeries: ISeriesDataItem[]) =>
    thresholdSeries.reduce<number[]>((indexes, dataPoint, index, arr) => {
        if (index > 0) {
            const currentIsEmpty = isEmptyDataPoint(dataPoint.y);
            const previousIsEmpty = isEmptyDataPoint(arr[index - 1].y);
            if (currentIsEmpty && !previousIsEmpty) {
                indexes.push(index - 1); // the plot line will be placed at last non-empty point
            }
            if (!currentIsEmpty && previousIsEmpty) {
                indexes.push(index); // the plot line will be placed at the current non-empty point
            }
        }
        return indexes;
    }, []);

export const getStackedTrendDividerPlotLines = (
    dataSeries: ISeriesDataItem[],
    thresholdSeries: ISeriesDataItem[],
) =>
    thresholdSeries.reduce<number[]>((indexes, dataPoint, index, arr) => {
        if (index > 0 && index < dataSeries.length) {
            const currentThresholdIsEmpty = isEmptyDataPoint(dataPoint.y);
            const previousThresholdIsEmpty = isEmptyDataPoint(arr[index - 1].y);
            const currentDataIsEmpty = isEmptyDataPoint(dataSeries[index].y);
            const previousDataIsEmpty = isEmptyDataPoint(dataSeries[index - 1].y);

            if (currentThresholdIsEmpty && !previousThresholdIsEmpty && !currentDataIsEmpty) {
                indexes.push(index - 1); // the plot line will be placed at last non-empty point
            }
            if (!currentThresholdIsEmpty && previousThresholdIsEmpty && !previousDataIsEmpty) {
                indexes.push(index); // the plot line will be placed at the current non-empty point
            }
        }
        return indexes;
    }, []);

export interface ISeriesWithPlotLines {
    series: ISeriesItem[];
    plotLines?: number[];
}

const isThresholdSetupValid = (
    type: VisType,
    series: ISeriesItem[],
    config: IChartConfig,
    thresholdMeasures: string[],
) =>
    isLineChart(type) &&
    config.enableLineChartTrendThreshold &&
    thresholdMeasures.length > 0 &&
    series.length > 0 &&
    series[0].data.length > 0;

const findThresholdMeasureIndex = (dv: DataViewFacade, thresholdMeasures: string[]) =>
    dv
        .meta()
        .measureDescriptors()
        .findIndex((measure) => thresholdMeasures.includes(measure.measureHeaderItem.localIdentifier));

const isStackedChart = (dv: DataViewFacade) => dv.meta().attributeDescriptors().length === 2;

const isThresholdMeasureIndexValid = (
    thresholdMeasureIndex: number,
    series: ISeriesItem[],
    dv: DataViewFacade,
) => thresholdMeasureIndex > -1 && (isStackedChart(dv) || thresholdMeasureIndex < series.length);

export function setupThresholdZones(
    type: VisType,
    series: ISeriesItem[],
    dv: DataViewFacade,
    config: IChartConfig,
): ISeriesWithPlotLines {
    const thresholdMeasures = config.thresholdMeasures || [];

    if (!isThresholdSetupValid(type, series, config, thresholdMeasures)) {
        return { series };
    }

    const thresholdMeasureIndex = findThresholdMeasureIndex(dv, thresholdMeasures);

    if (!isThresholdMeasureIndexValid(thresholdMeasureIndex, series, dv)) {
        return { series };
    }
    return isStackedChart(dv)
        ? computeZonesForStackedChart(series, thresholdMeasureIndex)
        : computeZonesForNonStackedChart(series, thresholdMeasureIndex);
}

const areZonesValid = (zones: IZone[]) =>
    !(zones.length === 0 || (zones.length === 1 && zones[0].dashStyle === "solid"));

const fixLegendIndex = (series: ISeriesItem[]) =>
    series.map((series, index) => ({ ...series, legendIndex: index }));

function computeZonesForNonStackedChart(
    series: ISeriesItem[],
    thresholdMeasureIndex: number,
): ISeriesWithPlotLines {
    const renderedSeries = series.filter((_value, index) => index !== thresholdMeasureIndex);
    const thresholdSeries = series[thresholdMeasureIndex];

    const zones = generateZones(thresholdSeries.data);

    if (!areZonesValid(zones)) {
        // no zone was generated, just don't render the threshold series, and fix legend index for the rest
        return { series: fixLegendIndex(renderedSeries) };
    }

    return {
        series: renderedSeries.map((series, index) => ({
            ...series,
            legendIndex: index,
            zoneAxis: "x",
            zones,
        })),
        plotLines: getTrendDividerPlotLines(thresholdSeries.data),
    };
}

function computeZonesForStackedChart(
    series: ISeriesItem[],
    thresholdMeasureIndex: number,
): ISeriesWithPlotLines {
    const pairedSeries = series.map((series) => {
        // split each series data to two new series, one with series data, one with threshold zone data
        const [oddData, evenData] = series.data.reduce<[ISeriesDataItem[], ISeriesDataItem[]]>(
            ([odd, even], item, index) => {
                if (index % 2 === 0) {
                    even.push(item);
                } else {
                    odd.push(item);
                }
                return [odd, even];
            },
            [[], []],
        );
        // determine which series will go first, based on order of measures in bucket (to match the buckets)
        const firstSeriesData = thresholdMeasureIndex === 0 ? oddData : evenData;
        const secondSeriesData = thresholdMeasureIndex === 0 ? evenData : oddData;
        return [
            {
                ...series,
                data: firstSeriesData,
            },
            {
                ...series,
                data: secondSeriesData,
            },
        ];
    });

    // compute zone per series pair, hide threshold series, even when no zone was generated, no need to touch
    // legend index as the legend contains segments, not the metrics, and there's still the same amount of
    // segments
    const zonedSeries: ISeriesItem[] = pairedSeries.map(([dataSeries, thresholdSeries]) => {
        const zones = generateZones(thresholdSeries.data);
        if (!areZonesValid(zones)) {
            return dataSeries;
        }

        return {
            ...dataSeries,
            zoneAxis: "x",
            zones,
        };
    });

    const plotLines = pairedSeries.flatMap(([dataSeries, thresholdSeries]) =>
        getStackedTrendDividerPlotLines(dataSeries.data, thresholdSeries.data),
    );

    return { series: zonedSeries, plotLines };
}

export const filterThresholdZonesCategories = (
    type: VisType,
    categories: any[],
    series: ISeriesItem[],
    dv: DataViewFacade,
    config: IChartConfig,
): any[] => {
    const thresholdMeasures = config.thresholdMeasures || [];

    if (!isThresholdSetupValid(type, series, config, thresholdMeasures)) {
        return categories;
    }

    const thresholdMeasureIndex = findThresholdMeasureIndex(dv, thresholdMeasures);
    if (!isThresholdMeasureIndexValid(thresholdMeasureIndex, series, dv)) {
        return categories;
    }
    // threshold chart series are split: odd numbers go to data series, even to threshold series,
    // therefore we must filter out odd categories, as each category is duplicated
    return isStackedChart(dv) ? categories.filter((_, index) => index % 2 === 0) : categories;
};
