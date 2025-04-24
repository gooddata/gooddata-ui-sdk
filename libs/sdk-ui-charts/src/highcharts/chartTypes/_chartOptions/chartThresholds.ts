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
    thresholdSeries.reduce<number[]>((indexes, { y: value }, i, arr) => {
        if (i > 0) {
            const currentIsEmpty = isEmptyDataPoint(value);
            const previousIsEmpty = isEmptyDataPoint(arr[i - 1].y);
            if (currentIsEmpty && !previousIsEmpty) {
                indexes.push(i - 1); // the plot line will be placed at last non-empty point
            }
            if (!currentIsEmpty && previousIsEmpty) {
                indexes.push(i); // the plot line will be placed at the current non-empty point
            }
        }
        return indexes;
    }, []);

export function setupThresholdZones(
    type: VisType,
    series: ISeriesItem[],
    dv: DataViewFacade,
    config: IChartConfig,
): { series: ISeriesItem[]; plotLines?: number[] } {
    const thresholdMeasures = config.thresholdMeasures || [];

    if (
        !isLineChart(type) ||
        !config.enableLineChartTrendThreshold ||
        thresholdMeasures.length === 0 ||
        series.length === 0 ||
        series[0].data.length === 0
    ) {
        return { series };
    }

    const thresholdMeasureIndex = dv
        .meta()
        .measureDescriptors()
        .findIndex((measure) => thresholdMeasures.includes(measure.measureHeaderItem.localIdentifier));

    if (thresholdMeasureIndex === -1) {
        return { series };
    }

    const renderedSeries = series.filter((_value, index) => index !== thresholdMeasureIndex);
    const thresholdSeries = series[thresholdMeasureIndex];
    const zones = generateZones(thresholdSeries.data);

    if (zones.length === 0 || (zones.length === 1 && zones[0].dashStyle === "solid")) {
        // no zone was generated, there's no need to update series, just don't render the threshold series
        return { series: renderedSeries };
    }

    return {
        series: renderedSeries.map((series) => ({
            ...series,
            zoneAxis: "x",
            zones,
        })),
        plotLines: getTrendDividerPlotLines(thresholdSeries.data),
    };
}
