// (C) 2007-2023 GoodData Corporation
import noop from "lodash/noop.js";
import isString from "lodash/isString.js";
import merge from "lodash/merge.js";
import map from "lodash/map.js";
import partial from "lodash/partial.js";
import isEmpty from "lodash/isEmpty.js";
import compact from "lodash/compact.js";
import every from "lodash/every.js";
import isNil from "lodash/isNil.js";
import pickBy from "lodash/pickBy.js";
import cx from "classnames";
import { ClientFormatterFacade } from "@gooddata/number-formatter";

import { styleVariables } from "./styles/variables.js";
import { IDrillConfig, ChartType, VisualizationTypes } from "@gooddata/sdk-ui";
import { IAxisConfig, IChartConfig } from "../../../interfaces/index.js";
import {
    formatAsPercent,
    getLabelStyle,
    getLabelsVisibilityConfig,
    getTotalsVisibilityConfig,
    getTotalsVisibility,
} from "./dataLabelsHelpers.js";
import { HOVER_BRIGHTNESS, MINIMUM_HC_SAFE_BRIGHTNESS } from "./commonConfiguration.js";
import { getLighterColor } from "@gooddata/sdk-ui-vis-commons";
import {
    isAreaChart,
    isBarChart,
    isBubbleChart,
    isBulletChart,
    isColumnChart,
    isComboChart,
    isHeatmap,
    isInvertedChartType,
    isOneOfTypes,
    isRotationInRange,
    isScatterPlot,
    isSupportingJoinedAttributeAxisName,
    percentFormatter,
} from "../_util/common.js";
import {
    shouldEndOnTick,
    shouldFollowPointer,
    shouldStartOnTick,
    shouldXAxisStartOnTickOnBubbleScatter,
    shouldYAxisStartOnTickOnBubbleScatter,
} from "./helpers.js";

import getOptionalStackingConfiguration from "./getOptionalStackingConfiguration.js";
import { getZeroAlignConfiguration } from "./getZeroAlignConfiguration.js";
import { canComboChartBeStackedInPercent } from "../comboChart/comboChartOptions.js";
import { getAxisNameConfiguration } from "./getAxisNameConfiguration.js";
import { getAxisLabelConfigurationForDualBarChart } from "./getAxisLabelConfigurationForDualBarChart.js";
import {
    supportedDualAxesChartTypes,
    supportedTooltipFollowPointerChartTypes,
} from "../_chartOptions/chartCapabilities.js";
import {
    IUnsafeTooltipPositionerPointObject,
    IAxis,
    IChartOptions,
    IChartOptionsData,
    ISeriesItem,
} from "../../typings/unsafe.js";
import { AXIS_LINE_COLOR } from "../_util/color.js";
import { IntlShape } from "react-intl";
import { HighchartsOptions, XAxisOptions, YAxisOptions } from "../../lib/index.js";
import { AxisLabelsFormatterCallbackFunction } from "highcharts";
import { isMeasureFormatInPercent, ITheme } from "@gooddata/sdk-model";
import { getContinuousLineConfiguration } from "./getContinuousLineConfiguration.js";
import { getWaterfallXAxisConfiguration } from "./getWaterfallXAxisConfiguration.js";
import { getChartOrientationConfiguration } from "./getChartOrientationConfiguration.js";

const EMPTY_DATA: IChartOptionsData = { categories: [], series: [] };

const ALIGN_LEFT = "left";
const ALIGN_RIGHT = "right";
const ALIGN_CENTER = "center";

const TOOLTIP_ARROW_OFFSET = 23;
const TOOLTIP_MAX_WIDTH = 320;
const TOOLTIP_INVERTED_CHART_VERTICAL_OFFSET = 5;
const TOOLTIP_VERTICAL_OFFSET = 14;
const BAR_COLUMN_TOOLTIP_TOP_OFFSET = 8;
const BAR_COLUMN_TOOLTIP_LEFT_OFFSET = 5;
const HIGHCHARTS_TOOLTIP_TOP_LEFT_OFFSET = 16;
const MIN_RANGE = 2;

// custom limit to hide data labels to improve performance
const HEATMAP_DATA_LABELS_LIMIT = 150;

// in viewport <= 480, tooltip width is equal to chart container width
const TOOLTIP_FULLSCREEN_THRESHOLD = 480;

export const TOOLTIP_PADDING = 24; // padding of tooltip container - defined by CSS
export const TOOLTIP_VIEWPORT_MARGIN_TOP = 20;

const BAR_WIDTH_WHEN_TOTAL_LABELS_AVAILABLE = "90%";

const escapeAngleBrackets = (str: any) => {
    return str?.replace(/</g, "&lt;")?.replace(/>/g, "&gt;");
};

function getAxisTitleConfiguration<T extends XAxisOptions | YAxisOptions>(axis: IAxis): T {
    return (
        axis
            ? {
                  title: {
                      text: escapeAngleBrackets(axis?.label ?? ""),
                  },
              }
            : {}
    ) as T;
}

function getTitleConfiguration(chartOptions: IChartOptions): HighchartsOptions {
    const { yAxes = [], xAxes = [] } = chartOptions;
    const yAxis = yAxes.map((axis) => getAxisTitleConfiguration<YAxisOptions>(axis));
    const xAxis = xAxes.map((axis) => getAxisTitleConfiguration<XAxisOptions>(axis));

    return {
        yAxis,
        xAxis,
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function formatOverlappingForParentAttribute(category: any): string {
    // category is passed from 'grouped-categories' which is highcharts plug-in
    if (!category) {
        return formatOverlapping.call(this);
    }

    const categoriesCount = (this.axis?.categoriesTree ?? []).length;
    if (categoriesCount === 1) {
        // Let the width be auto to make sure "this.value" is displayed on screen
        return `<div style="overflow: hidden; text-overflow: ellipsis">${this.value}</div>`;
    }
    const chartHeight = this.axis?.chart?.chartHeight ?? 1;
    const width = Math.floor(chartHeight / categoriesCount);
    const pixelOffset = 40; // parent attribute should have more space than its children

    const finalWidth = Math.max(0, width - pixelOffset);

    return `<div style="width: ${finalWidth}px; overflow: hidden; text-overflow: ellipsis">${this.value}</div>`;
}

export function formatOverlapping(): string {
    const categoriesCount = (this.axis?.categories ?? []).length;
    if (categoriesCount === 1) {
        // Let the width be auto to make sure "this.value" is displayed on screen
        return `<div align="center" style="overflow: hidden; text-overflow: ellipsis">${this.value}</div>`;
    }
    const chartHeight = this.chart?.chartHeight ?? 1;
    const width = Math.floor(chartHeight / categoriesCount);
    const pixelOffset = 20;

    const finalWidth = Math.max(0, width - pixelOffset);

    return (
        `<div align="center" style="width: ${finalWidth}px; overflow: hidden; text-overflow: ellipsis">` +
        this.value +
        "</div>"
    );
}

function hideOverlappedLabels(
    chartOptions: IChartOptions,
    _config: HighchartsOptions,
    chartConfig?: IChartConfig,
): HighchartsOptions {
    const rotation = Number(chartOptions?.xAxisProps?.rotation ?? "0");

    // rotate labels for charts that are horizontal (bar, bullet, waterfall with vertical orientation config)
    const isInvertedChart = isInvertedChartType(chartOptions.type, chartConfig?.orientation?.position);

    if (isInvertedChart && isRotationInRange(rotation, 75, 105)) {
        const { xAxes = [], isViewByTwoAttributes } = chartOptions;

        return {
            xAxis: xAxes.map(
                (axis: any): XAxisOptions =>
                    axis
                        ? {
                              labels: {
                                  useHTML: true,
                                  formatter: isViewByTwoAttributes
                                      ? formatOverlappingForParentAttribute
                                      : formatOverlapping,
                              },
                          }
                        : {},
            ),
        };
    }

    return {};
}

function getArrowAlignment(arrowPosition: any, chartWidth: any) {
    const minX = -TOOLTIP_ARROW_OFFSET;
    const maxX = chartWidth + TOOLTIP_ARROW_OFFSET;

    if (arrowPosition + TOOLTIP_MAX_WIDTH / 2 > maxX && arrowPosition - TOOLTIP_MAX_WIDTH / 2 > minX) {
        return ALIGN_RIGHT;
    }

    if (arrowPosition - TOOLTIP_MAX_WIDTH / 2 < minX && arrowPosition + TOOLTIP_MAX_WIDTH / 2 < maxX) {
        return ALIGN_LEFT;
    }

    return ALIGN_CENTER;
}

const getTooltipHorizontalStartingPosition = (arrowPosition: any, chartWidth: any, tooltipWidth: any) => {
    switch (getArrowAlignment(arrowPosition, chartWidth)) {
        case ALIGN_RIGHT:
            return arrowPosition - tooltipWidth + TOOLTIP_ARROW_OFFSET;
        case ALIGN_LEFT:
            return arrowPosition - TOOLTIP_ARROW_OFFSET;
        default:
            return arrowPosition - tooltipWidth / 2;
    }
};

function getArrowHorizontalPosition(chartType: any, stacking: any, dataPointEnd: any, dataPointHeight: any) {
    if (isBarChart(chartType) && stacking) {
        return dataPointEnd - dataPointHeight / 2;
    }

    return dataPointEnd;
}

function getDataPointEnd(chartType: any, isNegative: any, endPoint: any, height: any, stacking: any) {
    return isBarChart(chartType) && isNegative && stacking ? endPoint + height : endPoint;
}

function getDataPointStart(chartType: any, isNegative: any, endPoint: any, height: any, stacking: any) {
    return isColumnChart(chartType) && isNegative && stacking ? endPoint - height : endPoint;
}

function getTooltipVerticalOffset(chartType: any, stacking: any, point: any) {
    if (isColumnChart(chartType) && (stacking || point.negative)) {
        return 0;
    }

    if (isInvertedChartType(chartType)) {
        return TOOLTIP_INVERTED_CHART_VERTICAL_OFFSET;
    }

    return TOOLTIP_VERTICAL_OFFSET;
}

export function getTooltipPositionInChartContainer(
    chartType: string,
    stacking: string,
    labelWidth: number,
    labelHeight: number,
    point: IUnsafeTooltipPositionerPointObject,
): { x: number; y: number } {
    const dataPointEnd = getDataPointEnd(chartType, point.negative, point.plotX, point.h, stacking);
    const arrowPosition = getArrowHorizontalPosition(chartType, stacking, dataPointEnd, point.h);
    const chartWidth = this.chart.plotWidth;

    const tooltipHorizontalStartingPosition = getTooltipHorizontalStartingPosition(
        arrowPosition,
        chartWidth,
        labelWidth,
    );

    const verticalOffset = getTooltipVerticalOffset(chartType, stacking, point);

    const dataPointStart = getDataPointStart(chartType, point.negative, point.plotY, point.h, stacking);

    return {
        x: this.chart.plotLeft + tooltipHorizontalStartingPosition,
        y: this.chart.plotTop + dataPointStart - (labelHeight + verticalOffset),
    };
}

function getHighchartTooltipTopOffset(chartType: string): number {
    if (
        isBarChart(chartType) ||
        isBulletChart(chartType) ||
        isColumnChart(chartType) ||
        isComboChart(chartType)
    ) {
        return BAR_COLUMN_TOOLTIP_TOP_OFFSET;
    }
    return HIGHCHARTS_TOOLTIP_TOP_LEFT_OFFSET;
}

function getHighchartTooltipLeftOffset(chartType: string): number {
    if (
        isBarChart(chartType) ||
        isBulletChart(chartType) ||
        isColumnChart(chartType) ||
        isComboChart(chartType)
    ) {
        return BAR_COLUMN_TOOLTIP_LEFT_OFFSET;
    }
    return HIGHCHARTS_TOOLTIP_TOP_LEFT_OFFSET;
}
export function getTooltipPositionInViewPort(
    chartType: string,
    stacking: string,
    labelWidth: number,
    labelHeight: number,
    point: IUnsafeTooltipPositionerPointObject,
): { x: number; y: number } {
    const { x, y } = getTooltipPositionInChartContainer.call(
        this,
        chartType,
        stacking,
        labelWidth,
        labelHeight,
        point,
    );
    const { top: containerTop, left: containerLeft } = this.chart.container.getBoundingClientRect();
    const leftOffset = pageXOffset + containerLeft - getHighchartTooltipLeftOffset(chartType);
    const topOffset = pageYOffset + containerTop - getHighchartTooltipTopOffset(chartType);

    const posX = isTooltipShownInFullScreen() ? leftOffset : leftOffset + x;
    const posY = topOffset + y;

    const minPosY = TOOLTIP_VIEWPORT_MARGIN_TOP - TOOLTIP_PADDING + pageYOffset;
    const posYLimited = posY < minPosY ? minPosY : posY;

    return {
        x: posX,
        y: posYLimited,
    };
}

const isTooltipShownInFullScreen = () => {
    return document.documentElement.clientWidth <= TOOLTIP_FULLSCREEN_THRESHOLD;
};

function formatTooltip(tooltipCallback: any, chartConfig: IChartConfig, intl?: IntlShape) {
    const { chart } = this.series;
    const { color: pointColor } = this.point;
    const chartWidth = chart.spacingBox.width;
    const isFullScreenTooltip = isTooltipShownInFullScreen();
    const maxTooltipContentWidth = isFullScreenTooltip ? chartWidth : Math.min(chartWidth, TOOLTIP_MAX_WIDTH);
    const isDrillable = this.point.drilldown;

    // when brushing, do not show tooltip
    if (chart.mouseIsDown) {
        return false;
    }

    const strokeStyle = pointColor ? `border-top-color: ${pointColor};` : "";
    const tooltipStyle = isFullScreenTooltip ? `width: ${maxTooltipContentWidth}px;` : "";

    // null disables whole tooltip
    const tooltipContent: string = tooltipCallback(this.point, maxTooltipContentWidth, this.percentage);
    const interactionMessage = getInteractionMessage(isDrillable, chartConfig, intl);

    return tooltipContent !== null
        ? `<div class="hc-tooltip gd-viz-tooltip" style="${tooltipStyle}">
            <span class="gd-viz-tooltip-stroke" style="${strokeStyle}"></span>
            <div class="gd-viz-tooltip-content" style="max-width: ${maxTooltipContentWidth}px;">
                ${tooltipContent}
                ${interactionMessage}
            </div>
        </div>`
        : null;
}

function getInteractionMessage(isDrillable: boolean, chartConfig: IChartConfig, intl: IntlShape) {
    const message = intl
        ? chartConfig.useGenericInteractionTooltip
            ? intl.formatMessage({ id: "visualization.tooltip.generic.interaction" })
            : intl.formatMessage({ id: "visualization.tooltip.interaction" })
        : null;
    return isDrillable && intl ? `<div class="gd-viz-tooltip-interaction">${message}</div>` : "";
}

function formatLabel(value: any, format: string, config: IChartConfig = {}) {
    // no labels for missing values
    if (isNil(value)) {
        return null;
    }

    const { separators } = config;

    const parsedNumber: number | null =
        value === null || undefined ? null : typeof value === "string" ? parseFloat(value) : value;

    // Based on the tests, when a format is not provided, we should refrain from formatting the value using the formatter, as the default format "#,##0.00" will be used.
    // Additionally, the test necessitates that the value should remain unformatted.
    if (!isEmpty(format)) {
        const formatted = ClientFormatterFacade.formatValue(parsedNumber, format, separators);
        return escapeAngleBrackets(formatted.formattedValue);
    }

    return parsedNumber.toString();
}

function labelFormatter(config?: IChartConfig) {
    return formatLabel(this.y, this.point?.format, config);
}

function axisLabelFormatter(config: IChartConfig, format: string) {
    return this.value === 0 ? 0 : formatLabel(this.value, format, config);
}

export function percentageDataLabelFormatter(config?: IChartConfig): string {
    // suppose that chart has one Y axis by default
    const isSingleAxis = (this.series?.chart?.yAxis?.length ?? 1) === 1;
    const isPrimaryAxis = !(this.series?.yAxis?.opposite ?? false);

    // only format data labels to percentage for
    //  * left or right axis on single axis chart, or
    //  * primary axis on dual axis chart
    if (this.percentage && (isSingleAxis || isPrimaryAxis)) {
        return percentFormatter(this.percentage, this.series?.data?.length > 0 && this.series.data[0].format);
    }

    return labelFormatter.call(this, config);
}

export function firstValuePercentageLabelFormatter(config?: IChartConfig): string {
    const firstValue = this.series?.data?.[0]?.y;

    const formatted = labelFormatter.call(this, config);
    const percentageOfFirstValue = (this.y / firstValue) * 100;
    const percFormatted = Math.round(percentageOfFirstValue);
    return `${formatted} (${percFormatted}%)`;
}

function labelFormatterHeatmap(options: any) {
    return formatLabel(this.point.value, options.formatGD, options.config);
}

function level1LabelsFormatter(config?: IChartConfig) {
    return `${this.point?.name} (${formatLabel(this.point?.node?.val, this.point?.format, config)})`;
}
function level2LabelsFormatter(config?: IChartConfig) {
    return `${this.point?.name} (${formatLabel(this.point?.value, this.point?.format, config)})`;
}

function labelFormatterBubble(config?: IChartConfig) {
    const value = this.point?.z;
    if (isNil(value) || isNaN(value)) {
        return null;
    }

    const xAxisMin = this.series?.xAxis?.min;
    const xAxisMax = this.series?.xAxis?.max;
    const yAxisMin = this.series?.yAxis?.min;
    const yAxisMax = this.series?.yAxis?.max;

    if (
        (!isNil(xAxisMax) && this.x > xAxisMax) ||
        (!isNil(xAxisMin) && this.x < xAxisMin) ||
        (!isNil(yAxisMax) && this.y > yAxisMax) ||
        (!isNil(yAxisMin) && this.y < yAxisMin)
    ) {
        return null;
    } else {
        return formatLabel(value, this.point?.format, config);
    }
}

function labelFormatterScatter() {
    const name = this.point?.name;
    if (name) {
        return escapeAngleBrackets(name);
    }
    return null;
}

// check whether series contains only positive values, not consider nulls
function hasOnlyPositiveValues(series: any, x: any) {
    return every(series, (seriesItem: any) => {
        const dataPoint = seriesItem.yData[x];
        return dataPoint !== null && dataPoint >= 0;
    });
}

function stackLabelFormatter(config?: IChartConfig) {
    // show labels: always for negative,
    // without negative values or with non-zero total for positive
    const showStackLabel =
        this.isNegative || hasOnlyPositiveValues(this.axis.series, this.x) || this.total !== 0;
    return showStackLabel ? formatLabel(this.total, this.axis?.userOptions?.defaultFormat, config) : null;
}

function getTooltipConfiguration(
    chartOptions: IChartOptions,
    _config?: any,
    chartConfig?: IChartConfig,
    _drillConfig?: IDrillConfig,
    intl?: IntlShape,
): HighchartsOptions {
    const tooltipAction = chartOptions.actions?.tooltip;
    const chartType = chartOptions.type;
    const { stacking } = chartOptions;

    const followPointer = isOneOfTypes(chartType, supportedTooltipFollowPointerChartTypes)
        ? { followPointer: shouldFollowPointer(chartOptions) }
        : {};

    return tooltipAction
        ? {
              tooltip: {
                  borderWidth: 0,
                  borderRadius: 0,
                  shadow: false,
                  useHTML: true,
                  outside: true,
                  positioner: partial(getTooltipPositionInViewPort, chartType, stacking),
                  formatter: partial(formatTooltip, tooltipAction, chartConfig, intl),
                  enabled: chartConfig?.tooltip?.enabled ?? true,
                  ...followPointer,
              },
          }
        : {};
}

function getTreemapLabelsConfiguration(
    isMultiLevel: boolean,
    style: any,
    config?: IChartConfig,
    labelsConfig?: object,
) {
    const smallLabelInCenter = {
        dataLabels: {
            enabled: true,
            padding: 2,
            formatter: partial(level2LabelsFormatter, config),
            allowOverlap: false,
            style,
            ...labelsConfig,
        },
    };
    if (isMultiLevel) {
        return {
            dataLabels: {
                ...labelsConfig,
            },
            levels: [
                {
                    level: 1,
                    dataLabels: {
                        enabled: true,
                        align: "left",
                        verticalAlign: "top",
                        padding: 5,
                        style: {
                            ...style,
                            fontSize: "14px",
                            fontFamily: "gdcustomfont, Avenir, 'Helvetica Neue', Arial, sans-serif",
                        },
                        formatter: partial(level1LabelsFormatter, config),
                        allowOverlap: false,
                        ...labelsConfig,
                    },
                },
                {
                    level: 2,
                    ...smallLabelInCenter,
                },
            ],
        };
    } else {
        return {
            dataLabels: {
                ...labelsConfig,
            },
            levels: [
                {
                    level: 1,
                    ...smallLabelInCenter,
                },
            ],
        };
    }
}

function shouldDisableHeatmapDataLabels(series: ISeriesItem[]): boolean {
    return series.some((item) => item.data?.length >= HEATMAP_DATA_LABELS_LIMIT);
}

function getLabelsConfiguration(chartOptions: IChartOptions, _config: any, chartConfig?: IChartConfig) {
    const { stacking, yAxes = [], type } = chartOptions;
    const { stackMeasuresToPercent = false, enableSeparateTotalLabels = false } = chartConfig || {};

    const labelsVisible = chartConfig?.dataLabels?.visible;

    // handling of existing behaviour
    const totalsVisible =
        isBarChart(type) && !enableSeparateTotalLabels ? false : getTotalsVisibility(chartConfig);

    const labelsConfig = getLabelsVisibilityConfig(labelsVisible);

    const style = getLabelStyle(type, stacking);

    const yAxis = yAxes.map((axis: any) => ({
        defaultFormat: axis?.format,
    }));

    const series: ISeriesItem[] = chartOptions.data?.series ?? [];
    const canStackInPercent = canComboChartBeStackedInPercent(series);

    // only applied to bar, column, dual axis and area chart
    const dataLabelFormatter =
        stackMeasuresToPercent && canStackInPercent ? percentageDataLabelFormatter : labelFormatter;

    // only applied to funnel if configured (default=true)
    const funnelFormatter =
        chartConfig?.dataLabels?.percentsVisible !== false
            ? firstValuePercentageLabelFormatter
            : labelFormatter;

    const DEFAULT_LABELS_CONFIG = {
        formatter: partial(labelFormatter, chartConfig),
        style,
        allowOverlap: false,
        ...labelsConfig,
    };

    // workaround for missing data labels on last stacked measure with limited axis
    // see https://github.com/highcharts/highcharts/issues/15145
    const dataLabelsBugWorkaround = stackMeasuresToPercent && canStackInPercent ? { inside: true } : {};

    // only applied to heatmap chart
    const areHeatmapDataLabelsDisabled = shouldDisableHeatmapDataLabels(series);
    const heatmapLabelsConfig = areHeatmapDataLabelsDisabled ? { enabled: false } : labelsConfig;

    return {
        plotOptions: {
            gdcOptions: {
                dataLabels: {
                    visible: labelsVisible,
                    totalsVisible: totalsVisible,
                },
            },
            bar: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(dataLabelFormatter, chartConfig),
                    ...dataLabelsBugWorkaround,
                },
            },
            column: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(dataLabelFormatter, chartConfig),
                    ...dataLabelsBugWorkaround,
                },
            },
            heatmap: {
                dataLabels: {
                    formatter: labelFormatterHeatmap,
                    config: chartConfig,
                    ...heatmapLabelsConfig,
                },
            },
            treemap: {
                ...getTreemapLabelsConfiguration(!!stacking, style, chartConfig, labelsConfig),
            },
            line: {
                dataLabels: DEFAULT_LABELS_CONFIG,
            },
            area: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(dataLabelFormatter, chartConfig),
                },
            },
            scatter: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(labelFormatterScatter, chartConfig),
                },
            },
            bubble: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(labelFormatterBubble, chartConfig),
                },
            },
            pie: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    verticalAlign: "middle",
                },
            },
            waterfall: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                },
            },
            pyramid: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    inside: "true",
                },
            },
            funnel: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(funnelFormatter, chartConfig),
                    inside: "true",
                },
            },
            sankey: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: noop,
                },
            },
            dependencywheel: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: noop,
                },
            },
        },
        yAxis,
    };
}

function getDataPointsConfiguration(_chartOptions: IChartOptions, _config: any, chartConfig?: IChartConfig) {
    const dataPointsVisible = chartConfig?.dataPoints?.visible ?? true;
    const dataPointsConfig = {
        marker: {
            enabled: dataPointsVisible === "auto" ? undefined : dataPointsVisible,
        },
    };

    return {
        plotOptions: {
            line: dataPointsConfig,
            area: dataPointsConfig,
        },
    };
}

function isNonStackingConfiguration(chartOptions: IChartOptions, chartConfig?: IChartConfig) {
    const { type, data } = chartOptions;
    if (chartConfig?.continuousLine?.enabled && !chartConfig?.stackMeasures) {
        return (
            (isAreaChart(type) && data?.series?.length === 1) ||
            (isComboChart(type) && !isAreaChart(chartConfig?.primaryChartType))
        );
    }
    return false;
}

function getStackingConfiguration(
    chartOptions: IChartOptions,
    _config: any,
    chartConfig?: IChartConfig,
): HighchartsOptions {
    const { stacking, yAxes = [], type } = chartOptions;

    if (!stacking) {
        return {};
    }

    const totalLabelsConfig = getTotalsVisibilityConfig(type, chartConfig);

    const yAxis = yAxes.map(() => ({
        stackLabels: {
            ...totalLabelsConfig,
            formatter: partial(stackLabelFormatter, chartConfig),
        },
    }));

    const connectNulls = isAreaChart(type) ? { connectNulls: true } : {};
    const nonStacking = isNonStackingConfiguration(chartOptions, chartConfig);

    // extra space allocation for total labels if available
    const totalsVisibleByLabelsConfig =
        isNil(chartConfig?.dataLabels?.totalsVisible) && !!chartConfig?.dataLabels?.visible;
    const totalLabelsExtention =
        isBarChart(type) &&
        chartConfig?.enableSeparateTotalLabels &&
        (!!chartConfig?.dataLabels?.totalsVisible || totalsVisibleByLabelsConfig) &&
        !chartConfig.stackMeasuresToPercent
            ? {
                  chart: { marginRight: 0 },
                  yAxis: yAxis.map((element) => {
                      return { ...element, width: BAR_WIDTH_WHEN_TOTAL_LABELS_AVAILABLE };
                  }),
              }
            : {};

    return {
        plotOptions: {
            series: {
                stacking: nonStacking ? undefined : stacking, // this stacking config will be applied to all series
                ...connectNulls,
            },
        },
        yAxis,
        ...totalLabelsExtention,
    };
}

function getSeries(series: any) {
    return series.map((seriesItem: any) => {
        return {
            ...seriesItem,

            // Escaping is handled by highcharts so we don't want to provide escaped input.
            // With one exception, though. Highcharts supports defining styles via
            // for example <b>...</b> and parses that from series name.
            // So to avoid this parsing, escape only < and > to &lt; and &gt;
            // which is understood by highcharts correctly
            name: seriesItem?.name && escapeAngleBrackets(seriesItem?.name),

            // Escape data items for pie chart
            data: seriesItem?.data?.map((dataItem: any) => {
                if (!dataItem) {
                    return dataItem;
                }

                return {
                    ...dataItem,
                    name: escapeAngleBrackets(dataItem.name),
                };
            }),
        };
    });
}

function getHeatmapDataConfiguration(chartOptions: IChartOptions): HighchartsOptions {
    const data = chartOptions.data || EMPTY_DATA;
    const series = data.series;
    const categories = data.categories;

    return {
        series,
        xAxis: [
            {
                categories: categories[0] || [],
            },
        ],
        yAxis: [
            {
                categories: categories[1] || [],
            },
        ],
        colorAxis: {
            dataClasses: chartOptions?.colorAxis?.dataClasses ?? [],
        },
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function escapeCategories(dataCategories: any): any {
    return map(dataCategories, (category: any) => {
        return isString(category)
            ? escapeAngleBrackets(category)
            : {
                  name: escapeAngleBrackets(category.name),
                  categories: map(category.categories, escapeAngleBrackets),
              };
    });
}

function getDataConfiguration(chartOptions: IChartOptions): HighchartsOptions {
    const data = chartOptions.data || EMPTY_DATA;
    const series = getSeries(data.series);
    const { type } = chartOptions;

    switch (type) {
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.BUBBLE:
        case VisualizationTypes.WATERFALL:
            return {
                series,
            };
        case VisualizationTypes.HEATMAP:
            return getHeatmapDataConfiguration(chartOptions);
    }

    const categories = escapeCategories(data.categories);

    return {
        series,
        xAxis: [
            {
                categories,
            },
        ],
    };
}

function lineSeriesMapFn(seriesOrig: any) {
    if (seriesOrig.isDrillable) {
        return {
            ...seriesOrig,
            marker: {
                ...seriesOrig?.marker,
                states: {
                    ...seriesOrig?.marker?.states,
                    hover: {
                        ...seriesOrig?.marker?.states?.hover,
                        fillColor: getLighterColor(seriesOrig.color, HOVER_BRIGHTNESS),
                    },
                },
            },
        };
    }

    return {
        ...seriesOrig,
        states: {
            ...seriesOrig?.states,
            hover: {
                ...seriesOrig?.states?.hover,
                halo: {
                    ...seriesOrig?.states?.hover?.halo,
                    size: 0,
                },
            },
        },
    };
}

function barSeriesMapFn(seriesOrig: any) {
    return {
        ...seriesOrig,
        states: {
            ...seriesOrig?.states,
            hover: {
                ...seriesOrig?.states?.hover,
                brightness: HOVER_BRIGHTNESS,
                enabled: seriesOrig.isDrillable,
            },
        },
    };
}

function getHeatMapHoverColor(config: any) {
    const dataClasses = config?.colorAxis?.dataClasses ?? null;
    let resultColor = "rgb(210,210,210)";

    if (dataClasses) {
        if (dataClasses.length === 1) {
            resultColor = dataClasses[0].color;
        } else if (dataClasses.length > 1) {
            resultColor = dataClasses[1].color;
        }
    }

    return getLighterColor(resultColor, 0.2);
}

function getHoverStyles({ type }: any, config: any) {
    let seriesMapFn = noop;

    switch (type) {
        case VisualizationTypes.LINE:
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.AREA:
        case VisualizationTypes.BUBBLE:
            seriesMapFn = lineSeriesMapFn;
            break;

        case VisualizationTypes.BAR:
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BULLET:
            seriesMapFn = barSeriesMapFn;
            break;
        case VisualizationTypes.HEATMAP:
            seriesMapFn = (series, config) => {
                const color = getHeatMapHoverColor(config);
                return {
                    ...series,
                    states: {
                        ...series?.states,
                        hover: {
                            ...series?.states?.hover,
                            color,
                            enabled: series.isDrillable,
                        },
                    },
                };
            };
            break;

        case VisualizationTypes.COMBO:
        case VisualizationTypes.COMBO2:
            seriesMapFn = (seriesOrig) => {
                const { type } = seriesOrig;

                if (type === "line" || type === "area") {
                    return lineSeriesMapFn(seriesOrig);
                }
                return barSeriesMapFn(seriesOrig);
            };
            break;

        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.TREEMAP:
        case VisualizationTypes.WATERFALL:
        case VisualizationTypes.FUNNEL:
        case VisualizationTypes.PYRAMID:
        case VisualizationTypes.SANKEY:
        case VisualizationTypes.DEPENDENCY_WHEEL:
            seriesMapFn = (series) => {
                return {
                    ...series,
                    data: series.data.map((dataItemOrig: any) => {
                        const drilldown = dataItemOrig?.drilldown;
                        const pointHalo = !drilldown
                            ? {
                                  // see plugins/pointHalo.js
                                  halo: {
                                      ...dataItemOrig?.halo,
                                      size: 0,
                                  },
                              }
                            : {};

                        return {
                            ...dataItemOrig,
                            states: {
                                ...dataItemOrig?.states,
                                hover: {
                                    ...dataItemOrig?.states?.hover,
                                    brightness: drilldown ? HOVER_BRIGHTNESS : MINIMUM_HC_SAFE_BRIGHTNESS,
                                },
                            },
                            ...pointHalo,
                        };
                    }),
                };
            };
            break;

        default:
            throw new Error(`Undefined chart type "${type}".`);
    }
    return {
        series: config.series.map((item: any) => seriesMapFn(item, config)),
    };
}

function getGridConfiguration(
    chartOptions: IChartOptions,
    _config: any,
    _chartConfig: IChartConfig,
    _drillConfig: any,
    _intl: any,
    theme: ITheme,
) {
    const gridEnabled = chartOptions.grid?.enabled ?? true;
    const { yAxes = [], xAxes = [] } = chartOptions;
    const gridColor =
        theme?.chart?.gridColor ?? theme?.palette?.complementary?.c3 ?? styleVariables.gdColorGrid;

    const config = gridEnabled ? { gridLineWidth: 1, gridLineColor: gridColor } : { gridLineWidth: 0 };

    const yAxis = yAxes.map(() => config);

    const bothAxesGridlineCharts = [VisualizationTypes.BUBBLE, VisualizationTypes.SCATTER];
    let xAxis = {};
    if (isOneOfTypes(chartOptions.type, bothAxesGridlineCharts)) {
        xAxis = xAxes.map(() => config);
    }

    return {
        yAxis,
        xAxis,
    };
}

export function areAxisLabelsEnabled(
    chartOptions: IChartOptions,
    axisPropsName: keyof IChartOptions,
    shouldCheckForEmptyCategories: boolean,
): { enabled: boolean } {
    const data = chartOptions.data || EMPTY_DATA;

    const { type } = chartOptions;
    const categories = isHeatmap(type) ? data.categories : escapeCategories(data.categories);
    const categoriesFlag = shouldCheckForEmptyCategories ? !isEmpty(compact(categories)) : true;

    const axisOptions = chartOptions?.[axisPropsName] as IAxisConfig;
    const visible = axisOptions?.visible ?? true;
    const labelsEnabled = axisOptions?.labelsEnabled ?? true;

    return {
        enabled: categoriesFlag && visible && labelsEnabled,
    };
}

function shouldExpandYAxis(chartOptions: IChartOptions) {
    const min = chartOptions?.xAxisProps?.min ?? "";
    const max = chartOptions?.xAxisProps?.max ?? "";
    return min === "" && max === "" ? {} : { getExtremesFromAll: true };
}

function getAxisLineConfiguration(chartType: ChartType, isAxisVisible: boolean) {
    let lineWidth;

    if (isAxisVisible === false) {
        lineWidth = 0;
    } else {
        lineWidth = isScatterPlot(chartType) || isBubbleChart(chartType) ? 1 : undefined;
    }

    return pickBy({ AXIS_LINE_COLOR, lineWidth }, (item: any) => item !== undefined);
}

function getXAxisTickConfiguration(chartOptions: IChartOptions) {
    const { type } = chartOptions;
    if (isBubbleChart(type) || isScatterPlot(type)) {
        return {
            startOnTick: shouldXAxisStartOnTickOnBubbleScatter(chartOptions),
            endOnTick: false,
        };
    }

    return {};
}

function getYAxisTickConfiguration(
    chartOptions: IChartOptions,
    axisPropsKey: "yAxisProps" | "secondary_yAxisProps",
) {
    const { type, yAxes } = chartOptions;
    if (isBubbleChart(type) || isScatterPlot(type)) {
        return {
            startOnTick: shouldYAxisStartOnTickOnBubbleScatter(chartOptions),
        };
    }

    if (isOneOfTypes(type, supportedDualAxesChartTypes) && yAxes.length > 1) {
        // disable { startOnTick, endOnTick } to make gridline sync in both axes
        return {};
    }

    return {
        startOnTick: shouldStartOnTick(chartOptions, axisPropsKey),
        endOnTick: shouldEndOnTick(chartOptions, axisPropsKey),
    };
}

export const getFormatterProperty = (
    chartOptions: IChartOptions,
    axisPropsKey: "yAxisProps" | "xAxisProps" | "secondary_yAxisProps" | "secondary_xAxisProps",
    chartConfig: IChartConfig,
    axisFormat: string,
): { formatter?: AxisLabelsFormatterCallbackFunction } => {
    if (isMeasureFormatInPercent(axisFormat)) {
        return { formatter: partial(formatAsPercent, 100) };
    }

    const useCustomFormat = chartOptions?.[axisPropsKey]?.format === "inherit" ?? false;
    if (useCustomFormat) {
        return { formatter: partial(axisLabelFormatter, chartConfig, axisFormat) };
    }

    return {};
};

const getYAxisConfiguration = (
    chartOptions: IChartOptions,
    chartConfig: IChartConfig,
    axisValueColor: string,
    axisLabelColor: string,
): HighchartsOptions["yAxis"] => {
    const { forceDisableDrillOnAxes = false } = chartOptions;
    const type = chartOptions.type as ChartType;
    const yAxes = chartOptions.yAxes || [];
    return yAxes.map((axis: any): YAxisOptions => {
        if (!axis) {
            return {
                visible: false,
            };
        }

        const opposite = axis.opposite ?? false;
        const axisType = opposite ? "secondary" : "primary";
        const className = cx(`s-highcharts-${axisType}-yaxis`, {
            "gd-axis-label-drilling-disabled": forceDisableDrillOnAxes,
        });
        const axisPropsKey = opposite ? "secondary_yAxisProps" : "yAxisProps";

        // For bar chart take x axis options
        const min = chartOptions?.[axisPropsKey]?.min ?? "";
        const max = chartOptions?.[axisPropsKey]?.max ?? "";
        const visible = chartOptions?.[axisPropsKey]?.visible ?? true;

        const maxProp = max ? { max: Number(max) } : {};
        const minProp = min ? { min: Number(min) } : {};

        const rotation = chartOptions?.[axisPropsKey]?.rotation ?? "auto";
        const rotationProp = rotation !== "auto" ? { rotation: -Number(rotation) } : {};

        const shouldCheckForEmptyCategories = isHeatmap(type) ? true : false;
        const labelsEnabled = areAxisLabelsEnabled(chartOptions, axisPropsKey, shouldCheckForEmptyCategories);

        const formatter = getFormatterProperty(chartOptions, axisPropsKey, chartConfig, axis.format);

        const tickConfiguration = getYAxisTickConfiguration(chartOptions, axisPropsKey);

        const titleTextProp = visible ? {} : { text: null }; // new way how to hide title instead of deprecated 'enabled'

        return {
            ...getAxisLineConfiguration(type, visible),
            labels: {
                ...labelsEnabled,
                style: {
                    color: axisValueColor,
                    font: '12px gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif',
                },
                ...formatter,
                ...rotationProp,
            },
            title: {
                ...titleTextProp,
                margin: 15,
                style: {
                    color: axisLabelColor,
                    font: '14px gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif',
                },
            },
            opposite,
            className,
            ...maxProp,
            ...minProp,
            ...tickConfiguration,
        };
    });
};

const getXAxisConfiguration = (
    chartOptions: IChartOptions,
    chartConfig: IChartConfig,
    axisValueColor: string,
    axisLabelColor: string,
): HighchartsOptions["xAxis"] => {
    const { forceDisableDrillOnAxes = false } = chartOptions;
    const type = chartOptions.type as ChartType;
    const xAxes = chartOptions.xAxes || [];
    return xAxes.map((axis: any): XAxisOptions => {
        if (!axis) {
            return {
                visible: false,
            };
        }

        const opposite = axis.opposite ?? false;
        const axisPropsKey = opposite ? "secondary_xAxisProps" : "xAxisProps";
        const className: string = cx({
            "gd-axis-label-drilling-disabled": forceDisableDrillOnAxes,
        });

        const min = chartOptions[axisPropsKey]?.min ?? "";
        const max = chartOptions[axisPropsKey]?.max ?? "";

        const maxProp = max ? { max: Number(max) } : {};
        const minProp = min ? { min: Number(min) } : {};

        const isViewByTwoAttributes = chartOptions.isViewByTwoAttributes ?? false;
        const isInvertedChart = isInvertedChartType(chartOptions.type, chartConfig?.orientation?.position);
        const visible = chartOptions[axisPropsKey]?.visible ?? true;
        const rotation = chartOptions[axisPropsKey]?.rotation ?? "auto";
        const rotationProp = rotation !== "auto" ? { rotation: -Number(rotation) } : {};

        const shouldCheckForEmptyCategories = isScatterPlot(type) || isBubbleChart(type) ? false : true;
        const labelsEnabled = areAxisLabelsEnabled(chartOptions, axisPropsKey, shouldCheckForEmptyCategories);

        const formatter = getFormatterProperty(chartOptions, axisPropsKey, chartConfig, axis.format);

        const tickConfiguration = getXAxisTickConfiguration(chartOptions);
        // for minimum zoom level value
        const minRange =
            (chartConfig?.zoomInsight ?? false) && (chartOptions?.data?.categories ?? []).length > 2
                ? MIN_RANGE
                : undefined;

        const joinedAttributeAxisName: boolean =
            chartConfig?.enableJoinedAttributeAxisName && isSupportingJoinedAttributeAxisName(type);
        const titleTextProp =
            visible && (!isViewByTwoAttributes || joinedAttributeAxisName) ? {} : { text: null }; // new way how to hide title instead of deprecated 'enabled'

        // for bar chart take y axis options
        return {
            ...getAxisLineConfiguration(type, visible),

            // hide ticks on x axis
            minorTickLength: 0,
            tickLength: 0,

            // padding of maximum value
            maxPadding: 0.05,
            minRange,

            labels: {
                ...labelsEnabled,
                style: {
                    color: axisValueColor,
                    font: '12px gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif',
                },
                autoRotation: [-90],
                ...formatter,
                ...rotationProp,
                // Due to a bug in Highcharts & grouped-categories the autoRotation is working only with useHtml
                // See: https://github.com/blacklabel/grouped_categories/issues/137
                useHTML: !isInvertedChart && isViewByTwoAttributes,
            },
            title: {
                ...titleTextProp,
                margin: 10,
                style: {
                    textOverflow: "ellipsis",
                    color: axisLabelColor,
                    font: '14px gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif',
                },
            },
            className,
            ...maxProp,
            ...minProp,
            ...tickConfiguration,
        };
    });
};

function getAxesConfiguration(
    chartOptions: IChartOptions,
    _config: any,
    chartConfig: IChartConfig,
    _drillConfig: any,
    _intl: any,
    theme: ITheme,
): HighchartsOptions {
    const axisValueColor =
        theme?.chart?.axisValueColor ?? theme?.palette?.complementary?.c6 ?? styleVariables.gdColorStateBlank;
    const axisLabelColor =
        theme?.chart?.axisLabelColor ?? theme?.palette?.complementary?.c7 ?? styleVariables.gdColorLink;

    return {
        plotOptions: {
            series: {
                ...shouldExpandYAxis(chartOptions),
            },
        },
        yAxis: getYAxisConfiguration(chartOptions, chartConfig, axisValueColor, axisLabelColor),
        xAxis: getXAxisConfiguration(chartOptions, chartConfig, axisValueColor, axisLabelColor),
    };
}

function getTargetCursorConfigurationForBulletChart(chartOptions: IChartOptions) {
    const { type, data } = chartOptions;

    if (!isBulletChart(type)) {
        return {};
    }

    const isTargetDrillable = data.series.some(
        (series: ISeriesItem) => series.type === "bullet" && series.isDrillable,
    );

    return isTargetDrillable ? { plotOptions: { bullet: { cursor: "pointer" } } } : {};
}

function getZoomingAndPanningConfiguration(
    _chartOptions: IChartOptions,
    _config: any,
    chartConfig: IChartConfig,
): HighchartsOptions {
    return chartConfig?.zoomInsight
        ? {
              chart: {
                  animation: true,
                  zoomType: "x",
                  panKey: "shift",
                  panning: {
                      enabled: true,
                  },
                  resetZoomButton: {
                      theme: {
                          style: {
                              display: "none",
                          },
                      },
                  },
              },
          }
        : undefined;
}

function getReversedStacking(chartOptions: IChartOptions, _config: any, chartConfig: IChartConfig) {
    const { yAxes = [] } = chartOptions;
    const hasAnyStackOptionSelected =
        chartConfig?.stackMeasures ||
        chartConfig?.stackMeasuresToPercent ||
        chartOptions?.hasStackByAttribute;
    const shouldReverseStacking =
        isBarChart(chartConfig?.type) && chartConfig?.enableReversedStacking && hasAnyStackOptionSelected;

    return {
        yAxis: yAxes.map(
            (axis: IAxis): YAxisOptions =>
                axis
                    ? {
                          reversedStacks: shouldReverseStacking ? false : true,
                      }
                    : {},
        ),
    };
}

export function getCustomizedConfiguration(
    chartOptions: IChartOptions,
    chartConfig?: IChartConfig,
    drillConfig?: IDrillConfig,
    intl?: IntlShape,
    theme?: ITheme,
): HighchartsOptions {
    const configurators = [
        getTitleConfiguration,
        getAxesConfiguration,
        getStackingConfiguration,
        hideOverlappedLabels,
        getDataConfiguration,
        getTooltipConfiguration,
        getHoverStyles,
        getGridConfiguration,
        getLabelsConfiguration,
        getDataPointsConfiguration,
        // should be after 'getDataConfiguration' to modify 'series'
        // and should be after 'getStackingConfiguration' to get stackLabels config
        getOptionalStackingConfiguration,
        getZeroAlignConfiguration,
        getAxisNameConfiguration,
        getAxisLabelConfigurationForDualBarChart,
        getTargetCursorConfigurationForBulletChart,
        getZoomingAndPanningConfiguration,
        getReversedStacking,
        getContinuousLineConfiguration,
        getWaterfallXAxisConfiguration,
        getChartOrientationConfiguration,
    ];
    const commonData = configurators.reduce((config: HighchartsOptions, configurator: any) => {
        return merge(config, configurator(chartOptions, config, chartConfig, drillConfig, intl, theme));
    }, {});

    return merge({}, commonData);
}
