// (C) 2025 GoodData Corporation

// for some reason categories array is not typed in some cases
import { VisType, DataViewFacade } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../interfaces/index.js";
import { ISeriesItem, IZone, ISeriesDataItem } from "../../typings/unsafe.js";
import { isLineChart } from "../_util/common.js";

type DataPoint = number | null | undefined;

const isEmptyDataPoint = (value: DataPoint) => value === undefined || value === null || value === 0;

const getDashStyle = (value: DataPoint) => (isEmptyDataPoint(value) ? "shortDash" : "solid");

const generateZones = (data: ISeriesDataItem[]): IZone[] => {
    if (data.length === 0) {
        return [];
    }
    const zones = data.reduce<IZone[]>((zones, dataItem, index) => {
        const currentDashStyle = getDashStyle(dataItem.y);
        const previousZone = zones.length > 0 ? zones[zones.length - 1] : null;
        const previousDashStyle = previousZone ? previousZone.dashStyle : null;

        // Start a new zone when dash style changes
        if (!zones.length || currentDashStyle !== previousDashStyle) {
            // Mark the end of the previous zone
            if (previousZone) {
                previousZone.value = index;
            }
            // Start a new zone
            zones.push({ dashStyle: currentDashStyle });
        }
        return zones;
    }, []);

    // Process the final zone (should not have a value property to signify it runs to the end)
    if (zones.length > 0) {
        const lastZone = zones[zones.length - 1];
        return [...zones.slice(0, -1), { dashStyle: lastZone.dashStyle }];
    }
    return zones;
};

const isThresholdCrossingPoint = (currentValue: DataPoint, previousValue: DataPoint) => {
    const currentIsThreshold = isEmptyDataPoint(currentValue);
    const previousIsThreshold = isEmptyDataPoint(previousValue);
    return previousIsThreshold !== currentIsThreshold;
};

const getTrendDividerPlotLines = (thresholdSeries: ISeriesDataItem[]) =>
    thresholdSeries.reduce<number[]>((indexes, { y: value }, i, arr) => {
        if (i > 0 && isThresholdCrossingPoint(value, arr[i - 1].y)) {
            indexes.push(i);
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

    const thresholdSeries = series[thresholdMeasureIndex];
    const zones = generateZones(thresholdSeries.data);

    if (zones.length === 0 || (zones.length === 1 && zones[0].dashStyle === "solid")) {
        return { series };
    }

    return {
        series: series
            .filter((_value, index) => index !== thresholdMeasureIndex)
            .map((series) => {
                return {
                    ...series,
                    zoneAxis: "x",
                    zones,
                };
            }),
        plotLines: getTrendDividerPlotLines(thresholdSeries.data),
    };
}
