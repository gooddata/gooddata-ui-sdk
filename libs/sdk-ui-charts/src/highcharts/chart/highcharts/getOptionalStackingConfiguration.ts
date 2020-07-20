// (C) 2007-2020 GoodData Corporation
import partial from "lodash/partial";
import merge from "lodash/merge";
import includes from "lodash/includes";
import isNil from "lodash/isNil";
import set from "lodash/set";
import get from "lodash/get";
import { IChartConfig, IDataLabelsVisible } from "../../../interfaces";
import { formatAsPercent, getLabelStyle, getLabelsVisibilityConfig } from "./dataLabelsHelpers";
import {
    getPrimaryChartType,
    isInvertedChartType,
    isColumnChart,
    isComboChart,
    isLineChart,
} from "../../utils/common";
import { IDrillConfig } from "@gooddata/sdk-ui";
import { canComboChartBeStackedInPercent } from "../chartOptions/comboChartOptions";
import { isPrimaryYAxis } from "../../utils/isPrimaryYAxis";
import { supportedStackingAttributesChartTypes } from "../chartCapabilities";
import { NORMAL_STACK, PERCENT_STACK } from "../../constants/stacking";
import {
    IAxis,
    IChartOptions,
    IHighChartAxis,
    ISeriesItem,
    IStackMeasuresConfig,
    IYAxisConfig,
} from "../../typings/unsafe";

/**
 * Set 'normal' stacking config to single series which will overwrite config in 'plotOptions.series'
 * @param stackMeasures
 * @param seriesItem
 */
function handleStackMeasure(stackMeasures: boolean, seriesItem: ISeriesItem): ISeriesItem {
    return stackMeasures
        ? {
              ...seriesItem,
              stacking: NORMAL_STACK,
              stack: seriesItem.yAxis,
          }
        : seriesItem;
}

/**
 * Set 'percent' stacking config to single series which will overwrite config in 'plotOptions.series'
 * @param stackMeasuresToPercent
 * @param seriesItem
 */
function handleStackMeasuresToPercent(stackMeasuresToPercent: boolean, seriesItem: ISeriesItem): ISeriesItem {
    return stackMeasuresToPercent
        ? {
              ...seriesItem,
              stacking: PERCENT_STACK,
              stack: seriesItem.yAxis,
          }
        : seriesItem;
}

function getStackingValue(chartOptions: IChartOptions, seriesItem: ISeriesItem): string {
    const { yAxes, type } = chartOptions;
    const { stacking, yAxis } = seriesItem;
    const seriesChartType = seriesItem.type || type;
    const defaultStackingValue = isComboChart(type) ? null : NORMAL_STACK;

    return isPrimaryYAxis(yAxes[yAxis]) && !isLineChart(seriesChartType) ? stacking : defaultStackingValue;
}

function handleDualAxis(chartOptions: IChartOptions, seriesItem: ISeriesItem): ISeriesItem {
    const { yAxes, type } = chartOptions;
    const isDualAxis = yAxes.length === 2;

    if (!isDualAxis && !isComboChart(type)) {
        return seriesItem;
    }

    const { stacking } = seriesItem;

    // highcharts stack config
    // percent stack is only applied to primary Y axis
    const hcStackingConfig = stacking ? { stacking: getStackingValue(chartOptions, seriesItem) } : {};

    return {
        ...seriesItem,
        ...hcStackingConfig,
    };
}

function handleLabelStyle(chartOptions: IChartOptions, seriesItem: ISeriesItem): ISeriesItem {
    if (!isComboChart(chartOptions.type)) {
        return seriesItem;
    }

    const { type, stacking } = seriesItem;

    return {
        ...seriesItem,
        dataLabels: {
            style: getLabelStyle(type, stacking),
        },
    };
}

function countMeasuresInSeries(series: ISeriesItem[]): number[] {
    return series.reduce(
        (result: number[], seriesItem: ISeriesItem) => {
            result[seriesItem.yAxis] += 1;
            return result;
        },
        [0, 0],
    );
}

/**
 * For y axis having one series, this series should be removed stacking config
 * @param series
 */
export function getSanitizedStackingForSeries(series: ISeriesItem[]): ISeriesItem[] {
    const [primaryMeasuresNum, secondaryMeasuresNum] = countMeasuresInSeries(series);

    /**
     * stackMeasures is applied for both measures in each axis
     * stackMeasuresToPercent is applied for
     * - [measures on primary   y-axis only] or
     * - [measures on secondary y-axis only] or
     * - [applied for measures on primary y-axis + ignore for measures on secondary y-axis]
     */

    // has measures on both [primary y-axis] and [secondary y-axis]
    if (primaryMeasuresNum > 0 && secondaryMeasuresNum > 0) {
        return series.map((seriesItem: ISeriesItem) => {
            // seriesItem is on [secondary y-axis]
            if (seriesItem.yAxis === 1) {
                return {
                    ...seriesItem,
                    stack: null as number,
                    // reset stackMeasuresToPercent in this case (stacking: PERCENT_STACK)
                    stacking: seriesItem.stacking ? NORMAL_STACK : (null as string),
                };
            } else {
                return seriesItem;
            }
        });
    }

    // has [measures on primary y-axis only] or [measures on secondary y-axis only]
    return series;
}

function getSeriesConfiguration(
    chartOptions: IChartOptions,
    config: any,
    stackMeasures: boolean,
    stackMeasuresToPercent: boolean,
): { series: ISeriesItem[] } {
    const { series } = config;

    const handlers = [
        partial(handleStackMeasure, stackMeasures),
        partial(handleStackMeasuresToPercent, stackMeasuresToPercent),
        partial(handleDualAxis, chartOptions),
        partial(handleLabelStyle, chartOptions),
    ];

    // get series with stacking config
    const seriesWithStackingConfig = series.map((seriesItem: ISeriesItem) =>
        handlers.reduce((result, handler) => handler(result), seriesItem),
    );

    return {
        series: getSanitizedStackingForSeries(seriesWithStackingConfig),
    };
}

export function getYAxisConfiguration(
    chartOptions: IChartOptions,
    config: any,
    chartConfig: IChartConfig,
): IYAxisConfig {
    const type = getPrimaryChartType(chartOptions);
    const { yAxis } = config;
    const { stackMeasuresToPercent = false } = chartConfig;

    // only support column char
    // bar chart disables stack labels by default
    if (!isColumnChart(type)) {
        return {};
    }

    const labelsVisible: IDataLabelsVisible = get(chartConfig, "dataLabels.visible");
    const { enabled: dataLabelEnabled } = getLabelsVisibilityConfig(labelsVisible);

    // enable by default or follow dataLabels.visible config
    const stackLabelConfig = isNil(dataLabelEnabled) || dataLabelEnabled;

    const yAxisWithStackLabel = yAxis.map((axis: IHighChartAxis, index: number) => {
        // disable stack labels for primary Y axis when there is 'Stack to 100%' on
        const stackLabelEnabled = (index !== 0 || !stackMeasuresToPercent) && stackLabelConfig;
        return {
            ...axis,
            stackLabels: {
                enabled: stackLabelEnabled,
            },
        };
    });

    return { yAxis: yAxisWithStackLabel };
}

/**
 * Set config to highchart for 'Stack Measures' and 'Stack to 100%'
 * @param chartOptions
 * @param config
 * @param chartConfig
 */
export function getStackMeasuresConfiguration(
    chartOptions: IChartOptions,
    config: any,
    chartConfig: IChartConfig,
): IStackMeasuresConfig {
    const { stackMeasures = false, stackMeasuresToPercent = false } = chartConfig;
    const canStackInPercent = canComboChartBeStackedInPercent(config.series);

    if (!stackMeasures && !stackMeasuresToPercent) {
        return {};
    }

    return {
        ...getSeriesConfiguration(
            chartOptions,
            config,
            stackMeasures,
            stackMeasuresToPercent && canStackInPercent,
        ),
        ...getYAxisConfiguration(chartOptions, config, chartConfig),
    };
}

/**
 * Add style to X axis in case of 'grouped-categories'
 * @param chartOptions
 * @param config
 */
export function getParentAttributeConfiguration(chartOptions: IChartOptions, config: any) {
    const { type } = chartOptions;
    const { xAxis } = config;
    const xAxisItem = xAxis[0]; // expect only one X axis

    // parent attribute in X axis
    const parentAttributeOptions = {};

    // only apply font-weight to parent label
    set(parentAttributeOptions, "style", {
        fontWeight: "bold",
    });

    if (isInvertedChartType(type)) {
        // distance more 5px for two groups of attributes for bar chart
        set(parentAttributeOptions, "x", -5);
    }

    // 'groupedOptions' is custom property in 'grouped-categories' plugin
    set(xAxisItem, "labels.groupedOptions", [parentAttributeOptions]);

    return { xAxis: [xAxisItem] };
}

export function setDrillConfigToXAxis(drillConfig: IDrillConfig) {
    return { xAxis: [{ drillConfig }] };
}

/**
 * Format labels in Y axis from '0 - 100' to '0% - 100%'
 * Only applied when measure/series in Y axis more than one
 * @param chartOptions
 * @param _config
 * @param chartConfig
 */
export function getShowInPercentConfiguration(
    chartOptions: IChartOptions,
    config: any = {},
    chartConfig: IChartConfig,
) {
    const { stackMeasuresToPercent = false, primaryChartType } = chartConfig;
    const canStackInPercent = canComboChartBeStackedInPercent(config.series);

    if (!canStackInPercent || !stackMeasuresToPercent || isLineChart(primaryChartType)) {
        return {};
    }

    const { yAxes = [], type } = chartOptions;
    const percentageFormatter = partial(formatAsPercent, 1);

    // suppose that max number of y axes is 2
    // percentage format only supports primary axis
    const yAxis = yAxes.map((axis: IAxis, index: number) => {
        if (index !== 0 || (isComboChart(type) && !isPrimaryYAxis(axis))) {
            return {};
        }

        return {
            labels: {
                formatter: percentageFormatter,
            },
        };
    });
    return { yAxis };
}

/**
 * Convert [0, 1] to [0, 100], it's needed by highchart
 * Only applied to primary Y axis
 * @param _chartOptions
 * @param config
 * @param chartConfig
 */
export function convertMinMaxFromPercentToNumber(
    _chartOptions: IChartOptions,
    config: any,
    chartConfig: IChartConfig,
) {
    const { stackMeasuresToPercent = false } = chartConfig;
    if (!stackMeasuresToPercent) {
        return {};
    }

    const { yAxis: yAxes = [] as any[] } = config;
    const yAxis = yAxes.map((axis: any, _: number, axes: IAxis[]) => {
        const { min, max } = axis;
        const newAxis = {};

        if (!isNil(min)) {
            set(newAxis, "min", min * 100);
        }

        if (!isNil(max)) {
            set(newAxis, "max", max * 100);
        }

        const numberOfAxes = axes.length;
        if (numberOfAxes === 1) {
            return newAxis;
        }

        const { opposite = false } = axis;
        return opposite ? {} : newAxis;
    });

    return { yAxis };
}

export default function getOptionalStackingConfiguration(
    chartOptions: IChartOptions,
    config: any,
    chartConfig: IChartConfig = {},
    drillConfig?: IDrillConfig,
) {
    const { type } = chartOptions;
    return includes(supportedStackingAttributesChartTypes, type)
        ? merge(
              {},
              setDrillConfigToXAxis(drillConfig),
              getParentAttributeConfiguration(chartOptions, config),
              getStackMeasuresConfiguration(chartOptions, config, chartConfig),
              getShowInPercentConfiguration(chartOptions, config, chartConfig),
              convertMinMaxFromPercentToNumber(chartOptions, config, chartConfig),
          )
        : {};
}
