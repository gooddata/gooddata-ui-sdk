// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { type OptionsLandmarkVerbosityValue, type Point } from "highcharts";
import { compact, isEmpty, merge, partial, pickBy } from "lodash-es";
import { type IntlShape } from "react-intl";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type ITheme, isMeasureFormatInPercent } from "@gooddata/sdk-model";
import { type ChartType, type IDrillConfig, VisualizationTypes } from "@gooddata/sdk-ui";
import { getLighterColor, isPatternObject } from "@gooddata/sdk-ui-vis-commons";

import { HOVER_BRIGHTNESS, MINIMUM_HC_SAFE_BRIGHTNESS } from "./commonConfiguration.js";
import {
    formatAsPercent,
    getLabelsStyling,
    getLabelsVisibilityConfig,
    getTotalsVisibility,
    getTotalsVisibilityConfig,
} from "./dataLabelsHelpers.js";
import { getAxisLabelConfigurationForDualBarChart } from "./getAxisLabelConfigurationForDualBarChart.js";
import { getAxisNameConfiguration } from "./getAxisNameConfiguration.js";
import { getChartHighlightingConfiguration } from "./getChartHighlightingConfiguration.js";
import { getChartOrientationConfiguration } from "./getChartOrientationConfiguration.js";
import { getContinuousLineConfiguration } from "./getContinuousLineConfiguration.js";
import { getOptionalStackingConfiguration } from "./getOptionalStackingConfiguration.js";
import { getWaterfallXAxisConfiguration } from "./getWaterfallXAxisConfiguration.js";
import { getZeroAlignConfiguration } from "./getZeroAlignConfiguration.js";
import {
    shouldEndOnTick,
    shouldFollowPointer,
    shouldStartOnTick,
    shouldXAxisStartOnTickOnBubbleScatter,
    shouldYAxisStartOnTickOnBubbleScatter,
} from "./helpers.js";
import { styleVariables } from "./styles/variables.js";
import { type IAxisConfig, type IChartConfig } from "../../../interfaces/index.js";
import {
    type AxisLabelsFormatterCallbackFunction,
    type HighchartsOptions,
    type XAxisOptions,
    type YAxisOptions,
} from "../../lib/index.js";
import {
    type IAxis,
    type IChartOptions,
    type IChartOptionsData,
    type ISeriesItem,
    type ITooltipFactory,
    type IUnsafeTooltipPositionerPointObject,
} from "../../typings/unsafe.js";
import { isHighContrastMode } from "../../utils/highContrastMode.js";
import {
    supportedDualAxesChartTypes,
    supportedTooltipFollowPointerChartTypes,
} from "../_chartOptions/chartCapabilities.js";
import { AXIS_LINE_COLOR } from "../_util/color.js";
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
import { canComboChartBeStackedInPercent } from "../comboChart/comboChartOptions.js";

// Extended interfaces for Highcharts types with additional runtime properties
interface IExtendedAxis extends Highcharts.Axis {
    categoriesTree?: any[];
}

interface IExtendedChart extends Highcharts.Chart {
    spacingBox?: { width: number; height: number };
    mouseIsDown?: boolean;
}

interface IExtendedPoint extends Highcharts.Point {
    drilldown?: boolean;
    value?: number;
    node?: { val: number };
    z?: number;
    format?: string;
    percentage?: number;
}

interface IDataLabelFormatterContext extends Highcharts.Point {
    format: string;
    point?: Highcharts.Point;
}

interface IStackLabelFormatterContext extends Highcharts.AxisLabelsFormatterContextObject {
    axis: Highcharts.Axis & {
        userOptions: {
            defaultFormat?: string;
        };
    };
    isNegative: boolean;
    total: number;
    x: number;
}

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

function getTitleConfiguration(
    chartOptions: IChartOptions,
    _config: HighchartsOptions,
    chartConfig?: IChartConfig,
): HighchartsOptions {
    const { yAxes = [], xAxes = [] } = chartOptions;
    const yAxis = yAxes.map((axis) => getAxisTitleConfiguration<YAxisOptions>(axis));
    const xAxis = xAxes.map((axis) => getAxisTitleConfiguration<XAxisOptions>(axis));

    const titleConfig =
        chartConfig?.enableHighchartsAccessibility && chartConfig?.a11yTitle
            ? {
                  accessibility: {
                      description: chartConfig.a11yDescription,
                      enabled: true,
                      landmarkVerbosity: "disabled" as OptionsLandmarkVerbosityValue,
                      screenReaderSection: {
                          beforeChartFormat: "",
                      },
                  },
                  lang: {
                      accessibility: {
                          chartContainerLabel: chartConfig.a11yTitle,
                      },
                  },
                  title: {
                      text: chartConfig.a11yTitle,
                      style: {
                          // We want to set the title for accessibility purposes,
                          // but we don't want it to be visible since we already render the title separately.
                          fontSize: "0px",
                      },
                  },
              }
            : {};

    return {
        yAxis,
        xAxis,
        ...titleConfig,
    };
}

export function formatOverlappingForParentAttribute(
    this: Highcharts.AxisLabelsFormatterContextObject,
    category: any,
): string {
    // category is passed from 'grouped-categories' which is highcharts plug-in
    if (!category) {
        return formatOverlapping.call(this);
    }

    const categoriesCount = ((this.axis as IExtendedAxis)?.categoriesTree ?? []).length;
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

export function formatOverlapping(this: Highcharts.AxisLabelsFormatterContextObject): string {
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
    this: Highcharts.Tooltip,
    chartType: string | undefined,
    stacking: string | undefined,
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

function getHighchartTooltipTopOffset(chartType: string | undefined): number {
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

function getHighchartTooltipLeftOffset(chartType: string | undefined): number {
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

function getRelativeCoordinates(
    absoluteX: number,
    absoluteY: number,
    container: HTMLElement,
    chartType: string | undefined,
) {
    // Get the bounding rectangle of the container
    const containerRect = container.getBoundingClientRect();

    // Adjust the container's coordinates to account for page scrolling
    const containerX = containerRect.left + window.scrollX;
    const containerY = containerRect.top + window.scrollY;

    // Calculate the relative coordinates
    const relativeX = absoluteX - containerX + getHighchartTooltipLeftOffset(chartType);
    const relativeY = absoluteY - containerY;

    return { x: relativeX, y: relativeY };
}

export function getTooltipPositionInViewPort(
    this: Highcharts.Tooltip,
    chartType: string | undefined,
    stacking: string | undefined,
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
    const leftOffset = window.scrollX + containerLeft - getHighchartTooltipLeftOffset(chartType);
    const topOffset = window.scrollY + containerTop - getHighchartTooltipTopOffset(chartType);

    const posX = isTooltipShownInFullScreen() ? leftOffset : leftOffset + x;
    const posY = topOffset + y;

    const minPosY = TOOLTIP_VIEWPORT_MARGIN_TOP - TOOLTIP_PADDING + window.scrollY;
    const posYLimited = posY < minPosY ? minPosY : posY;

    // After migration to highcharts version 12.1.2 position of tooltip needs to be relative to container
    // so we need to calculate relative position of tooltip from absolute page position
    const relative = getRelativeCoordinates(posX, posYLimited, this.chart.container, chartType);

    return {
        x: relative.x,
        y: relative.y,
    };
}

const isTooltipShownInFullScreen = () => {
    return document.documentElement.clientWidth <= TOOLTIP_FULLSCREEN_THRESHOLD;
};

function getColorFromHighchartsPointColor(color: Point["color"]): string {
    const defaultColor = "transparent";

    if (!color) {
        return defaultColor;
    }
    if (typeof color === "string") {
        return color;
    }
    if ("pattern" in color) {
        return color.pattern.color!;
    }
    if ("stops" in color && color.stops.length > 0) {
        const gradientColor = color.stops[0].color;
        return typeof gradientColor === "string" ? gradientColor : defaultColor;
    }

    return defaultColor;
}

function formatTooltip(
    this: IExtendedPoint,
    tooltipCallback: ITooltipFactory,
    chartConfig?: IChartConfig,
    intl?: IntlShape,
) {
    const { chart } = this.series;

    const pointColor = getColorFromHighchartsPointColor(this.color);

    const chartWidth = (chart as IExtendedChart).spacingBox?.width;
    const isFullScreenTooltip = isTooltipShownInFullScreen();
    const maxTooltipContentWidth = isFullScreenTooltip
        ? chartWidth
        : Math.min(chartWidth!, TOOLTIP_MAX_WIDTH);
    const isDrillable = this.drilldown;

    // when brushing, do not show tooltip
    if ((chart as IExtendedChart).mouseIsDown) {
        return false;
    }

    const strokeStyle = pointColor ? `border-top-color: ${pointColor};` : "";
    const tooltipStyle = isFullScreenTooltip ? `width: ${maxTooltipContentWidth}px;` : "";

    // null disables whole tooltip
    const tooltipContent: string | null = tooltipCallback(
        this as any, // IUnsafeHighchartsTooltipPoint is expected by the callback
        maxTooltipContentWidth!,
        this.percentage,
    );
    const interactionMessage = getInteractionMessage(isDrillable, chartConfig, intl);

    return tooltipContent === null
        ? null
        : `<div class="hc-tooltip gd-viz-tooltip" style="${tooltipStyle}">
            <span class="gd-viz-tooltip-stroke" style="${strokeStyle}"></span>
            <div class="gd-viz-tooltip-content" style="max-width: ${maxTooltipContentWidth}px;">
                ${tooltipContent}
                ${interactionMessage}
            </div>
        </div>`;
}

function getInteractionMessage(
    isDrillable: boolean | undefined,
    chartConfig: IChartConfig | undefined = {},
    intl?: IntlShape,
) {
    const message = intl
        ? chartConfig.useGenericInteractionTooltip
            ? intl.formatMessage({ id: "visualization.tooltip.generic.interaction" })
            : intl.formatMessage({ id: "visualization.tooltip.interaction" })
        : null;
    return isDrillable && intl ? `<div class="gd-viz-tooltip-interaction">${message}</div>` : "";
}

function formatLabel(value: any, format: string | undefined, config: IChartConfig = {}) {
    // no labels for missing values
    if (value === null || value === undefined) {
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

    return parsedNumber!.toString();
}

function labelFormatter(this: IDataLabelFormatterContext, config?: IChartConfig) {
    return formatLabel(this.y, (this.point as IExtendedPoint)?.format || this.format, config);
}

function axisLabelFormatter(
    this: Highcharts.AxisLabelsFormatterContextObject,
    config: IChartConfig,
    format: string | undefined,
) {
    return this.value === 0 ? 0 : formatLabel(this.value, format, config);
}

export function percentageDataLabelFormatter(this: any, config?: IChartConfig): string {
    // suppose that chart has one Y axis by default
    const isSingleAxis = (this.series?.chart?.yAxis?.length ?? 1) === 1;
    const isPrimaryAxis = !(this.series?.yAxis?.opposite ?? false);

    // only format data labels to percentage for
    //  * left or right axis on single axis chart, or
    //  * primary axis on dual axis chart
    if (this.percentage && (isSingleAxis || isPrimaryAxis)) {
        return percentFormatter(this.percentage, this.series?.data?.[0]?.format);
    }

    return labelFormatter.call(this, config);
}

export function firstValuePercentageLabelFormatter(this: any, config?: IChartConfig): string {
    const firstValue = this.series?.data?.[0]?.y;

    const formatted = labelFormatter.call(this, config);
    const percentageOfFirstValue = (this.y / firstValue) * 100;
    const percFormatted = Math.round(percentageOfFirstValue);
    return `${formatted} (${percFormatted}%)`;
}

function labelFormatterHeatmap(this: { point: IExtendedPoint }, options: any) {
    return formatLabel(this.point.value, options.formatGD, options.config);
}

function level1LabelsFormatter(this: { point: IExtendedPoint }, config?: IChartConfig) {
    return `${this.point?.name} (${formatLabel(this.point?.node?.val, this.point?.format, config)})`;
}
function level2LabelsFormatter(this: { point: IExtendedPoint }, config?: IChartConfig) {
    return `${this.point?.name} (${formatLabel(this.point?.value, this.point?.format, config)})`;
}

function labelFormatterBubble(this: { point: IExtendedPoint } & Highcharts.Point, config?: IChartConfig) {
    const value = this.point?.z;
    if (value === null || value === undefined || isNaN(value)) {
        return null;
    }

    const xAxisMin = this.series?.xAxis?.min;
    const xAxisMax = this.series?.xAxis?.max;
    const yAxisMin = this.series?.yAxis?.min;
    const yAxisMax = this.series?.yAxis?.max;

    if (
        (!(xAxisMax === null || xAxisMax === undefined) && this.x > xAxisMax) ||
        (!(xAxisMin === null || xAxisMin === undefined) && this.x < xAxisMin) ||
        (!(xAxisMax === null || xAxisMax === undefined) && this.y! > yAxisMax!) ||
        (!(xAxisMin === null || xAxisMin === undefined) && this.y! < yAxisMin!)
    ) {
        return null;
    } else {
        return formatLabel(value, this.point?.format, config);
    }
}

function labelFormatterScatter(this: { point: IExtendedPoint }) {
    const name = this.point?.name;
    if (name) {
        return escapeAngleBrackets(name);
    }
    return null;
}

// check whether series contains only positive values, not consider nulls
function hasOnlyPositiveValues(series: any, x: any) {
    return series.every((seriesItem: any) => {
        const yData = seriesItem.getColumn("y");
        const dataPoint = yData[x];
        return dataPoint !== null && dataPoint >= 0;
    });
}

function stackLabelFormatter(this: IStackLabelFormatterContext, config?: IChartConfig) {
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
        ? {
              followPointer:
                  shouldFollowPointer(chartOptions) && !(chartConfig?.enableAccessibleTooltip ?? false),
          }
        : {
              followPointer: chartConfig?.enableAccessibleTooltip ? false : undefined, // undefined means use HCH default behavior
          };

    return tooltipAction
        ? {
              tooltip: {
                  borderWidth: 0,
                  borderRadius: 0,
                  shadow: false,
                  useHTML: true,
                  outside: true,
                  positioner: partial(getTooltipPositionInViewPort, chartType, stacking as any),
                  formatter: partial(formatTooltip, tooltipAction, chartConfig, intl),
                  enabled: chartConfig?.tooltip?.enabled ?? true,
                  className: chartConfig?.tooltip?.className,
                  stickOnContact: chartConfig?.enableAccessibleTooltip ?? false,
                  ...followPointer,
              },
          }
        : {};
}

function getTreemapLabelsConfiguration(
    isMultiLevel: boolean,
    styling: Highcharts.DataLabelsOptions,
    config?: IChartConfig,
    labelsConfig?: object,
) {
    const smallLabelInCenter = {
        dataLabels: {
            enabled: true,
            padding: 2,
            formatter: partial(level2LabelsFormatter, config),
            allowOverlap: false,
            ...styling,
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
                        ...styling,
                        style: {
                            ...styling.style,
                            fontSize: "14px",
                            fontFamily: `var(--gd-font-family, gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif)`,
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
    return series.some((item) => (item.data?.length ?? 0) >= HEATMAP_DATA_LABELS_LIMIT);
}

function getDataLabelsConfiguration(
    chartOptions: IChartOptions,
    _config: any,
    chartConfig?: IChartConfig,
    _drillConfig?: IDrillConfig,
    _intl?: IntlShape,
    theme?: ITheme,
) {
    const { stacking, yAxes = [], type } = chartOptions;
    const { stackMeasuresToPercent = false, enableSeparateTotalLabels = false } = chartConfig || {};

    const labelsVisible = chartConfig?.dataLabels?.visible;
    const labelsStyle = chartConfig?.dataLabels?.style;

    // handling of existing behaviour
    const totalsVisible =
        isBarChart(type) && !enableSeparateTotalLabels ? false : getTotalsVisibility(chartConfig);

    const labelsConfig = getLabelsVisibilityConfig(labelsVisible);

    const isBackplate = labelsStyle === "backplate";

    const styling = getLabelsStyling(type, stacking, theme, isBackplate);

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
        chartConfig?.dataLabels?.percentsVisible === false
            ? labelFormatter
            : firstValuePercentageLabelFormatter;

    const DEFAULT_LABELS_CONFIG = {
        formatter: partial(labelFormatter, chartConfig),
        ...styling,
        allowOverlap: false,
        ...labelsConfig,
    };

    // workaround for missing data labels on last stacked measure with limited axis
    // see https://github.com/highcharts/highcharts/issues/15145
    const dataLabelsBugWorkaround = stackMeasuresToPercent && canStackInPercent ? { inside: true } : {};

    // only applied to heatmap chart
    const areHeatmapDataLabelsDisabled = shouldDisableHeatmapDataLabels(series);
    const heatmapLabelsConfig = areHeatmapDataLabelsDisabled
        ? { enabled: false }
        : { ...labelsConfig, ...(isBackplate ? { ...styling, padding: 2 } : {}) };

    return {
        plotOptions: {
            gdcOptions: {
                dataLabels: {
                    visible: labelsVisible,
                    totalsVisible: totalsVisible,
                    style: labelsStyle,
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
                ...getTreemapLabelsConfiguration(!!stacking, styling, chartConfig, labelsConfig),
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
                    formatter: () => {},
                },
            },
            dependencywheel: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: () => {},
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
    })) as YAxisOptions[];

    const connectNulls = isAreaChart(type) ? { connectNulls: true } : {};
    const nonStacking = isNonStackingConfiguration(chartOptions, chartConfig);

    // extra space allocation for total labels if available
    const totalsVisibleByLabelsConfig =
        (chartConfig?.dataLabels?.totalsVisible === null ||
            chartConfig?.dataLabels?.totalsVisible === undefined) &&
        !!chartConfig?.dataLabels?.visible;
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
            segmentName: seriesItem?.segmentName && escapeAngleBrackets(seriesItem?.segmentName),

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
    const categories = data.categories ?? [];

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

export function escapeCategories(dataCategories: any[] | undefined): any {
    return dataCategories?.map((category) => {
        return typeof category === "string"
            ? escapeAngleBrackets(category)
            : {
                  name: escapeAngleBrackets(category.name),
                  categories: category.categories?.map(escapeAngleBrackets),
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
            resultColor = isPatternObject(dataClasses[0].color)
                ? dataClasses[0].color.pattern.color
                : dataClasses[0].color;
        } else if (dataClasses.length > 1) {
            resultColor = isPatternObject(dataClasses[1].color)
                ? dataClasses[1].color.pattern.color
                : dataClasses[1].color;
        }
    }

    return getLighterColor(resultColor, 0.2);
}

function getHoverStyles({ type }: any, config: any) {
    let seriesMapFn = (..._: any[]) => {};

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
                        const pointHalo = drilldown
                            ? {}
                            : {
                                  // see plugins/pointHalo.js
                                  halo: {
                                      ...dataItemOrig?.halo,
                                      size: 0,
                                  },
                              };

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
    const { type, yAxes = [] } = chartOptions;
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
    axisFormat: string | undefined,
): { formatter?: AxisLabelsFormatterCallbackFunction } => {
    if (isMeasureFormatInPercent(axisFormat)) {
        return { formatter: partial(formatAsPercent, 100) };
    }

    const useCustomFormat = chartOptions?.[axisPropsKey]?.format === "inherit" || false;
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
        const rotationProp = rotation === "auto" ? {} : { rotation: -Number(rotation) };

        const shouldCheckForEmptyCategories = !!isHeatmap(type);
        const labelsEnabled = areAxisLabelsEnabled(chartOptions, axisPropsKey, shouldCheckForEmptyCategories);

        const formatter = getFormatterProperty(chartOptions, axisPropsKey, chartConfig, axis.format);

        const tickConfiguration = getYAxisTickConfiguration(chartOptions, axisPropsKey);

        const titleTextProp = visible ? {} : { text: null }; // new way how to hide title instead of deprecated 'enabled'
        const isInvertedChart = isInvertedChartType(chartOptions.type, chartConfig?.orientation?.position);

        return {
            ...getAxisLineConfiguration(type, visible),
            labels: {
                ...labelsEnabled,
                style: {
                    color: axisValueColor,
                    font: '12px gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif',
                    textOverflow: isInvertedChart ? "ellipsis" : "unset", // We need disable ellipsis Y axis to backward compatibility with 9.6.0
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
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
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

function getXAxisMinRange(chartConfig: IChartConfig, chartOptions: IChartOptions): number | undefined {
    // for minimum zoom level value
    const hasZoomInsight = chartConfig?.zoomInsight ?? false;
    const hasEnoughCategories = (chartOptions?.data?.categories ?? []).length > 2;
    return hasZoomInsight && hasEnoughCategories ? MIN_RANGE : undefined;
}

function getXAxisTitleTextProp(
    visible: boolean,
    isViewByTwoAttributes: boolean,
    joinedAttributeAxisName: boolean,
): { text?: null } {
    // new way how to hide title instead of deprecated 'enabled'
    const shouldShowTitle = visible && (!isViewByTwoAttributes || joinedAttributeAxisName);
    return shouldShowTitle ? {} : { text: null };
}

function getXAxisPlotLinesProp(
    plotLines: number[] | undefined,
    plotLineColor: string,
): { plotLines?: Array<{ value: number; color: string; width: number; zIndex: number }> } {
    if (!plotLines || plotLines.length === 0) {
        return {};
    }
    return {
        plotLines: plotLines.map((value) => ({
            value,
            color: plotLineColor,
            width: 2,
            zIndex: 1,
        })),
    };
}

function buildXAxisOptions(
    axis: IAxis,
    chartOptions: IChartOptions,
    chartConfig: IChartConfig,
    axisValueColor: string,
    axisLabelColor: string,
    plotLineColor: string,
    forceDisableDrillOnAxes: boolean,
    type: ChartType,
): XAxisOptions {
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
    const rotationProp = rotation === "auto" ? {} : { rotation: -Number(rotation) };

    const shouldCheckForEmptyCategories = !(isScatterPlot(type) || isBubbleChart(type));
    const labelsEnabled = areAxisLabelsEnabled(chartOptions, axisPropsKey, shouldCheckForEmptyCategories);

    const formatter = getFormatterProperty(chartOptions, axisPropsKey, chartConfig, axis.format);

    const tickConfiguration = getXAxisTickConfiguration(chartOptions);
    const minRange = getXAxisMinRange(chartConfig, chartOptions);

    const joinedAttributeAxisName: boolean =
        !!chartConfig?.enableJoinedAttributeAxisName && isSupportingJoinedAttributeAxisName(type);
    const titleTextProp = getXAxisTitleTextProp(visible, isViewByTwoAttributes, joinedAttributeAxisName);

    const plotLinesProp = getXAxisPlotLinesProp(axis.plotLines, plotLineColor);

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
                textOverflow: isInvertedChart ? "unset" : "ellipsis", // We need disable ellipsis Y axis to backward compatibility with 9.6.0
            },
            autoRotation: [-45],
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
                color: axisLabelColor,
                font: '14px gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif',
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
            },
        },
        className,
        ...maxProp,
        ...minProp,
        ...tickConfiguration,
        ...plotLinesProp,
    };
}

const getXAxisConfiguration = (
    chartOptions: IChartOptions,
    chartConfig: IChartConfig,
    axisValueColor: string,
    axisLabelColor: string,
    plotLineColor: string,
): HighchartsOptions["xAxis"] => {
    const { forceDisableDrillOnAxes = false } = chartOptions;
    const type = chartOptions.type as ChartType;
    const xAxes = chartOptions.xAxes || [];
    return xAxes.map((axis: IAxis): XAxisOptions => {
        if (!axis) {
            return {
                visible: false,
            };
        }

        return buildXAxisOptions(
            axis,
            chartOptions,
            chartConfig,
            axisValueColor,
            axisLabelColor,
            plotLineColor,
            forceDisableDrillOnAxes,
            type,
        );
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
    const isHighContrast = isHighContrastMode();
    const axisValueColor = isHighContrast
        ? "CanvasText"
        : (theme?.chart?.axisValueColor ??
          theme?.chart?.axis?.valueColor ??
          theme?.palette?.complementary?.c6 ??
          styleVariables.gdColorStateBlank);
    const axisLabelColor = isHighContrast
        ? "CanvasText"
        : (theme?.chart?.axisLabelColor ??
          theme?.chart?.axis?.labelColor ??
          theme?.palette?.complementary?.c7 ??
          styleVariables.gdColorLink);
    const plotLineColor =
        theme?.chart?.plotLineColor ?? theme?.palette?.complementary?.c5 ?? styleVariables.gdColorPlotLine;
    return {
        plotOptions: {
            series: {
                ...shouldExpandYAxis(chartOptions),
            },
        },
        yAxis: getYAxisConfiguration(chartOptions, chartConfig, axisValueColor, axisLabelColor),
        xAxis: getXAxisConfiguration(
            chartOptions,
            chartConfig,
            axisValueColor,
            axisLabelColor,
            plotLineColor,
        ),
    };
}

function getTargetCursorConfigurationForBulletChart({ type, data }: IChartOptions) {
    if (!isBulletChart(type)) {
        return {};
    }

    const isTargetDrillable = data?.series?.some(
        (series: ISeriesItem) => series.type === "bullet" && series.isDrillable,
    );

    return isTargetDrillable ? { plotOptions: { bullet: { cursor: "pointer" } } } : {};
}

function getZoomingAndPanningConfiguration(
    _chartOptions: IChartOptions,
    _config: any,
    chartConfig?: IChartConfig,
): HighchartsOptions | undefined {
    return chartConfig?.zoomInsight
        ? {
              chart: {
                  zooming: {
                      type: "x",
                  },
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

function getReversedStacking(chartOptions: IChartOptions, _config: any, chartConfig?: IChartConfig) {
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
                          reversedStacks: !shouldReverseStacking,
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
        getDataLabelsConfiguration,
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
        getChartHighlightingConfiguration,
    ];
    const commonData = configurators.reduce((config: HighchartsOptions, configurator: any) => {
        return merge(config, configurator(chartOptions, config, chartConfig, drillConfig, intl, theme));
    }, {});

    return merge({}, commonData);
}
