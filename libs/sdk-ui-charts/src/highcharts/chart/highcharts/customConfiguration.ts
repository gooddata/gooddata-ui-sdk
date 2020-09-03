// (C) 2007-2020 GoodData Corporation
import noop from "lodash/noop";
import isString from "lodash/isString";
import set from "lodash/set";
import get from "lodash/get";
import merge from "lodash/merge";
import map from "lodash/map";
import partial from "lodash/partial";
import isEmpty from "lodash/isEmpty";
import compact from "lodash/compact";
import cloneDeep from "lodash/cloneDeep";
import every from "lodash/every";
import isNil from "lodash/isNil";
import pickBy from "lodash/pickBy";
import numberJS from "@gooddata/numberjs";
import cx from "classnames";

import { styleVariables } from "../../styles/variables";
import { IDrillConfig, ChartType, VisualizationTypes } from "@gooddata/sdk-ui";
import { IChartConfig, IDataLabelsVisible, IDataPointsVisible } from "../../../interfaces";
import { formatAsPercent, getLabelStyle, getLabelsVisibilityConfig, isInPercent } from "./dataLabelsHelpers";
import { HOVER_BRIGHTNESS, MINIMUM_HC_SAFE_BRIGHTNESS } from "./commonConfiguration";
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
    isTreemap,
    percentFormatter,
} from "../../utils/common";
import {
    shouldEndOnTick,
    shouldFollowPointer,
    shouldStartOnTick,
    shouldXAxisStartOnTickOnBubbleScatter,
    shouldYAxisStartOnTickOnBubbleScatter,
} from "./helpers";

import getOptionalStackingConfiguration from "./getOptionalStackingConfiguration";
import { getZeroAlignConfiguration } from "./getZeroAlignConfiguration";
import { canComboChartBeStackedInPercent } from "../chartOptions/comboChartOptions";
import { getAxisNameConfiguration } from "./getAxisNameConfiguration";
import { getChartAlignmentConfiguration } from "./getChartAlignmentConfiguration";
import { getAxisLabelConfigurationForDualBarChart } from "./getAxisLabelConfigurationForDualBarChart";
import { supportedDualAxesChartTypes, supportedTooltipFollowPointerChartTypes } from "../chartCapabilities";
import { IAxis, IChartOptions, IPointData, ISeriesItem } from "../../typings/unsafe";
import { AXIS_LINE_COLOR } from "../../utils/color";
import { IntlShape } from "react-intl";

const { stripColors, numberFormat }: any = numberJS;

const EMPTY_DATA: any = { categories: [], series: [] };

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

// in viewport <= 480, tooltip width is equal to chart container width
const TOOLTIP_FULLSCREEN_THRESHOLD = 480;

export const TOOLTIP_PADDING = 24; // padding of tooltip container - defined by CSS
export const TOOLTIP_VIEWPORT_MARGIN_TOP = 20;

const escapeAngleBrackets = (str: any) => str && str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

function getTitleConfiguration(chartOptions: IChartOptions) {
    const { yAxes = [], xAxes = [] } = chartOptions;
    const yAxis = yAxes.map((axis: IAxis) =>
        axis
            ? {
                  title: {
                      text: escapeAngleBrackets(get(axis, "label", "")),
                  },
              }
            : {},
    );

    const xAxis = xAxes.map((axis: IAxis) =>
        axis
            ? {
                  title: {
                      text: escapeAngleBrackets(get(axis, "label", "")),
                  },
              }
            : {},
    );

    return {
        yAxis,
        xAxis,
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function formatOverlappingForParentAttribute(category: any): string {
    // category is passed from 'grouped-categories' which is npm highcharts plug-in
    if (!category) {
        return formatOverlapping.call(this);
    }

    const categoriesCount = get(this, "axis.categoriesTree", []).length;
    if (categoriesCount === 1) {
        // Let the width be auto to make sure "this.value" is displayed on screen
        return `<div style="overflow: hidden; text-overflow: ellipsis">${this.value}</div>`;
    }
    const chartHeight = get(this, "axis.chart.chartHeight", 1);
    const width = Math.floor(chartHeight / categoriesCount);
    const pixelOffset = 40; // parent attribute should have more space than its children

    const finalWidth = Math.max(0, width - pixelOffset);

    return `<div style="width: ${finalWidth}px; overflow: hidden; text-overflow: ellipsis">${this.value}</div>`;
}

export function formatOverlapping(): string {
    const categoriesCount = get(this, "axis.categories", []).length;
    if (categoriesCount === 1) {
        // Let the width be auto to make sure "this.value" is displayed on screen
        return `<div align="center" style="overflow: hidden; text-overflow: ellipsis">${this.value}</div>`;
    }
    const chartHeight = get(this, "chart.chartHeight", 1);
    const width = Math.floor(chartHeight / categoriesCount);
    const pixelOffset = 20;

    const finalWidth = Math.max(0, width - pixelOffset);

    return (
        `<div align="center" style="width: ${finalWidth}px; overflow: hidden; text-overflow: ellipsis">` +
        this.value +
        "</div>"
    );
}

function hideOverlappedLabels(chartOptions: IChartOptions) {
    const rotation = Number(get(chartOptions, "xAxisProps.rotation", "0"));

    // rotate labels for charts that are horizontal (bar, bullet)
    const isInvertedChart = isInvertedChartType(chartOptions.type);

    if (isInvertedChart && isRotationInRange(rotation, 75, 105)) {
        const { xAxes = [], isViewByTwoAttributes } = chartOptions;

        return {
            xAxis: xAxes.map((axis: any) =>
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

function getShowInPercentConfiguration(chartOptions: IChartOptions) {
    const { yAxes = [], xAxes = [] } = chartOptions;
    const percentageFormatter = partial(formatAsPercent, 100);

    const xAxis = xAxes.map((axis: any) =>
        axis && isInPercent(axis.format)
            ? {
                  labels: {
                      formatter: percentageFormatter,
                  },
              }
            : {},
    );

    const yAxis = yAxes.map((axis: any) =>
        axis && isInPercent(axis.format)
            ? {
                  labels: {
                      formatter: percentageFormatter,
                  },
              }
            : {},
    );

    return {
        xAxis,
        yAxis,
    };
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
    point: IPointData,
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
    point: IPointData,
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

function formatTooltip(tooltipCallback: any, intl?: IntlShape) {
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
    const interactionMessage = getInteractionMessage(isDrillable, intl);

    return tooltipContent !== null
        ? `<div class="hc-tooltip gd-viz-tooltip" style="${tooltipStyle}">
            <span class="stroke gd-viz-tooltip-stroke" style="${strokeStyle}"></span>
            <div class="content gd-viz-tooltip-content" style="max-width: ${maxTooltipContentWidth}px;">
                ${tooltipContent}
                ${interactionMessage}
            </div>
        </div>`
        : null;
}

function getInteractionMessage(isDrillable: boolean, intl: IntlShape) {
    const message = intl ? intl.formatMessage({ id: "visualization.tooltip.interaction" }) : null;
    return isDrillable && intl ? `<div class="gd-viz-tooltip-interaction">${message}</div>` : "";
}

function formatLabel(value: any, format: any, config: IChartConfig = {}) {
    // no labels for missing values
    if (isNil(value)) {
        return null;
    }

    const stripped = stripColors(format || "");
    const { separators } = config;
    return escapeAngleBrackets(String(numberFormat(value, stripped, undefined, separators)));
}

function labelFormatter(config?: IChartConfig) {
    return formatLabel(this.y, get(this, "point.format"), config);
}

export function percentageDataLabelFormatter(config?: IChartConfig): string {
    // suppose that chart has one Y axis by default
    const isSingleAxis = get(this, "series.chart.yAxis.length", 1) === 1;
    const isPrimaryAxis = !get(this, "series.yAxis.opposite", false);

    // only format data labels to percentage for
    //  * left or right axis on single axis chart, or
    //  * primary axis on dual axis chart
    if (this.percentage && (isSingleAxis || isPrimaryAxis)) {
        return percentFormatter(this.percentage);
    }

    return labelFormatter.call(this, config);
}

function labelFormatterHeatmap(options: any) {
    return formatLabel(this.point.value, options.formatGD, options.config);
}

function level1LabelsFormatter(config?: IChartConfig) {
    return `${get(this, "point.name")} (${formatLabel(
        get(this, "point.node.val"),
        get(this, "point.format"),
        config,
    )})`;
}
function level2LabelsFormatter(config?: IChartConfig) {
    return `${get(this, "point.name")} (${formatLabel(
        get(this, "point.value"),
        get(this, "point.format"),
        config,
    )})`;
}

function labelFormatterBubble(config?: IChartConfig) {
    const value = get(this, "point.z");
    if (isNil(value) || isNaN(value)) {
        return null;
    }

    const xAxisMin = get(this, "series.xAxis.min");
    const xAxisMax = get(this, "series.xAxis.max");
    const yAxisMin = get(this, "series.yAxis.min");
    const yAxisMax = get(this, "series.yAxis.max");

    if (
        (!isNil(xAxisMax) && this.x > xAxisMax) ||
        (!isNil(xAxisMin) && this.x < xAxisMin) ||
        (!isNil(yAxisMax) && this.y > yAxisMax) ||
        (!isNil(yAxisMin) && this.y < yAxisMin)
    ) {
        return null;
    } else {
        return formatLabel(value, get(this, "point.format"), config);
    }
}

function labelFormatterScatter() {
    const name = get(this, "point.name");
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
    return showStackLabel
        ? formatLabel(this.total, get(this, "axis.userOptions.defaultFormat"), config)
        : null;
}

function getTooltipConfiguration(
    chartOptions: IChartOptions,
    _config?: any,
    _chartConfig?: IChartConfig,
    _drillConfig?: IDrillConfig,
    intl?: IntlShape,
) {
    const tooltipAction = get(chartOptions, "actions.tooltip");
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
                  formatter: partial(formatTooltip, tooltipAction, intl),
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

function getLabelsConfiguration(chartOptions: IChartOptions, _config: any, chartConfig?: IChartConfig) {
    const { stacking, yAxes = [], type } = chartOptions;

    const labelsVisible: IDataLabelsVisible = get(chartConfig, "dataLabels.visible");

    const labelsConfig = getLabelsVisibilityConfig(labelsVisible);

    const style = getLabelStyle(type, stacking);

    const drilldown =
        stacking || isTreemap(type)
            ? {
                  activeDataLabelStyle: {
                      color: "#ffffff",
                  },
              }
            : {};

    const yAxis = yAxes.map((axis: any) => ({
        defaultFormat: get(axis, "format"),
    }));

    const series: ISeriesItem[] = get(chartOptions, "data.series", []);
    const canStackInPercent = canComboChartBeStackedInPercent(series);
    const { stackMeasuresToPercent = false } = chartConfig || {};

    // only applied to bar, column, dual axis and area chart
    const dataLabelFormatter =
        stackMeasuresToPercent && canStackInPercent ? percentageDataLabelFormatter : labelFormatter;

    const DEFAULT_LABELS_CONFIG = {
        formatter: partial(labelFormatter, chartConfig),
        style,
        allowOverlap: false,
        ...labelsConfig,
    };

    return {
        drilldown,
        plotOptions: {
            gdcOptions: {
                dataLabels: {
                    visible: labelsVisible,
                },
            },
            bar: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(dataLabelFormatter, chartConfig),
                },
            },
            column: {
                dataLabels: {
                    ...DEFAULT_LABELS_CONFIG,
                    formatter: partial(dataLabelFormatter, chartConfig),
                },
            },
            heatmap: {
                dataLabels: {
                    formatter: labelFormatterHeatmap,
                    config: chartConfig,
                    ...labelsConfig,
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
        },
        yAxis,
    };
}

function getDataPointsConfiguration(_chartOptions: IChartOptions, _config: any, chartConfig?: IChartConfig) {
    const dataPointsVisible: IDataPointsVisible = get(chartConfig, "dataPoints.visible");
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

function getStackingConfiguration(chartOptions: IChartOptions, _config: any, chartConfig?: IChartConfig) {
    const { stacking, yAxes = [], type } = chartOptions;
    let labelsConfig = {};

    if (isColumnChart(type)) {
        const labelsVisible: IDataLabelsVisible = get(chartConfig, "dataLabels.visible");
        labelsConfig = getLabelsVisibilityConfig(labelsVisible);
    }

    const yAxis = yAxes.map(() => ({
        stackLabels: {
            ...labelsConfig,
            formatter: partial(stackLabelFormatter, chartConfig),
        },
    }));

    let connectNulls = {};
    if (stacking && isAreaChart(type)) {
        connectNulls = {
            connectNulls: true,
        };
    }

    return stacking
        ? {
              plotOptions: {
                  series: {
                      stacking, // this stacking config will be applied to all series
                      ...connectNulls,
                  },
              },
              yAxis,
          }
        : {};
}

function getSeries(series: any) {
    return series.map((seriesItem: any) => {
        const item = cloneDeep(seriesItem);
        // Escaping is handled by highcharts so we don't want to provide escaped input.
        // With one exception, though. Highcharts supports defining styles via
        // for example <b>...</b> and parses that from series name.
        // So to avoid this parsing, escape only < and > to &lt; and &gt;
        // which is understood by highcharts correctly
        item.name = item.name && escapeAngleBrackets(item.name);

        // Escape data items for pie chart
        item.data = item.data.map((dataItem: any) => {
            if (!dataItem) {
                return dataItem;
            }

            return {
                ...dataItem,
                name: escapeAngleBrackets(dataItem.name),
            };
        });

        return item;
    });
}

function getHeatmapDataConfiguration(chartOptions: IChartOptions) {
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
            dataClasses: get(chartOptions, "colorAxis.dataClasses", []),
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

function getDataConfiguration(chartOptions: IChartOptions) {
    const data = chartOptions.data || EMPTY_DATA;
    const series = getSeries(data.series);
    const { type } = chartOptions;

    switch (type) {
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.BUBBLE:
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
    const series = cloneDeep(seriesOrig);
    if (series.isDrillable) {
        set(series, "marker.states.hover.fillColor", getLighterColor(series.color, HOVER_BRIGHTNESS));
    } else {
        set(series, "states.hover.halo.size", 0);
    }

    return series;
}

function barSeriesMapFn(seriesOrig: any) {
    const series = cloneDeep(seriesOrig);

    set(series, "states.hover.brightness", HOVER_BRIGHTNESS);
    set(series, "states.hover.enabled", series.isDrillable);

    return series;
}

function getHeatMapHoverColor(config: any) {
    const dataClasses = get(config, ["colorAxis", "dataClasses"], null);
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
        default:
            throw new Error(`Undefined chart type "${type}".`);

        case VisualizationTypes.LINE:
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.AREA:
        case VisualizationTypes.BUBBLE:
            seriesMapFn = lineSeriesMapFn;
            break;

        case VisualizationTypes.BAR:
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BULLET:
        case VisualizationTypes.FUNNEL:
            seriesMapFn = barSeriesMapFn;
            break;
        case VisualizationTypes.HEATMAP:
            seriesMapFn = (seriesOrig, config) => {
                const series = cloneDeep(seriesOrig);
                const color = getHeatMapHoverColor(config);

                set(series, "states.hover.color", color);
                set(series, "states.hover.enabled", series.isDrillable);

                return series;
            };
            break;

        case VisualizationTypes.COMBO:
        case VisualizationTypes.COMBO2:
            seriesMapFn = (seriesOrig) => {
                const { type } = seriesOrig;

                if (type === "line") {
                    return lineSeriesMapFn(seriesOrig);
                }
                return barSeriesMapFn(seriesOrig);
            };
            break;

        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.TREEMAP:
            seriesMapFn = (seriesOrig) => {
                const series = cloneDeep(seriesOrig);

                return {
                    ...series,
                    data: series.data.map((dataItemOrig: any) => {
                        const dataItem = cloneDeep(dataItemOrig);
                        const drilldown = get(dataItem, "drilldown");

                        set(
                            dataItem,
                            "states.hover.brightness",
                            drilldown ? HOVER_BRIGHTNESS : MINIMUM_HC_SAFE_BRIGHTNESS,
                        );

                        if (!drilldown) {
                            set(dataItem, "halo.size", 0); // see plugins/pointHalo.js
                        }

                        return dataItem;
                    }),
                };
            };
            break;
    }
    return {
        series: config.series.map((item: any) => seriesMapFn(item, config)),
        plotOptions: {
            ...[
                VisualizationTypes.LINE,
                VisualizationTypes.AREA,
                VisualizationTypes.SCATTER,
                VisualizationTypes.BUBBLE,
            ].reduce(
                (conf: any, key) => ({
                    ...conf,
                    [key]: {
                        point: {
                            events: {
                                // Workaround
                                // from Highcharts 5.0.0 cursor can be set by using 'className' for individual data items
                                mouseOver() {
                                    if (this.drilldown) {
                                        this.graphic.element.style.cursor = "pointer";
                                    }
                                },
                            },
                        },
                    },
                }),
                {},
            ),
        },
    };
}

function getGridConfiguration(chartOptions: IChartOptions) {
    const gridEnabled = get(chartOptions, "grid.enabled", true);
    const { yAxes = [], xAxes = [] } = chartOptions;

    const config = gridEnabled ? { gridLineWidth: 1, gridLineColor: "#ebebeb" } : { gridLineWidth: 0 };

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
    axisPropsName: string,
    shouldCheckForEmptyCategories: boolean,
): { enabled: boolean } {
    const data = chartOptions.data || EMPTY_DATA;

    const { type } = chartOptions;
    const categories = isHeatmap(type) ? data.categories : escapeCategories(data.categories);

    const visible = get(chartOptions, `${axisPropsName}.visible`, true);

    const labelsEnabled = get(chartOptions, `${axisPropsName}.labelsEnabled`, true);

    const categoriesFlag = shouldCheckForEmptyCategories ? !isEmpty(compact(categories)) : true;

    return {
        enabled: categoriesFlag && visible && labelsEnabled,
    };
}

function shouldExpandYAxis(chartOptions: IChartOptions) {
    const min = get(chartOptions, "xAxisProps.min", "");
    const max = get(chartOptions, "xAxisProps.max", "");
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

function getYAxisTickConfiguration(chartOptions: IChartOptions, axisPropsKey: string) {
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

function getAxesConfiguration(chartOptions: IChartOptions) {
    const { forceDisableDrillOnAxes = false } = chartOptions;
    const type = chartOptions.type as ChartType;

    return {
        plotOptions: {
            series: {
                ...shouldExpandYAxis(chartOptions),
            },
        },
        yAxis: get(chartOptions, "yAxes", []).map((axis: any) => {
            if (!axis) {
                return {
                    visible: false,
                };
            }

            const opposite = get(axis, "opposite", false);
            const axisType: string = axis.opposite ? "secondary" : "primary";
            const className: string = cx(`s-highcharts-${axisType}-yaxis`, {
                "gd-axis-label-drilling-disabled": forceDisableDrillOnAxes,
            });
            const axisPropsKey = opposite ? "secondary_yAxisProps" : "yAxisProps";

            // For bar chart take x axis options
            const min = get(chartOptions, `${axisPropsKey}.min`, "");
            const max = get(chartOptions, `${axisPropsKey}.max`, "");
            const visible = get(chartOptions, `${axisPropsKey}.visible`, true);

            const maxProp = max ? { max: Number(max) } : {};
            const minProp = min ? { min: Number(min) } : {};

            const rotation = get(chartOptions, `${axisPropsKey}.rotation`, "auto");
            const rotationProp = rotation !== "auto" ? { rotation: -Number(rotation) } : {};

            const shouldCheckForEmptyCategories = isHeatmap(type) ? true : false;
            const labelsEnabled = areAxisLabelsEnabled(
                chartOptions,
                axisPropsKey,
                shouldCheckForEmptyCategories,
            );

            const tickConfiguration = getYAxisTickConfiguration(chartOptions, axisPropsKey);

            return {
                ...getAxisLineConfiguration(type, visible),
                labels: {
                    ...labelsEnabled,
                    style: {
                        color: styleVariables.gdColorStateBlank,
                        font: '12px Avenir, "Helvetica Neue", Arial, sans-serif',
                    },
                    ...rotationProp,
                },
                title: {
                    enabled: visible,
                    margin: 15,
                    style: {
                        color: styleVariables.gdColorLink,
                        font: '14px Avenir, "Helvetica Neue", Arial, sans-serif',
                    },
                },
                opposite,
                className,
                ...maxProp,
                ...minProp,
                ...tickConfiguration,
            };
        }),

        xAxis: get(chartOptions, "xAxes", []).map((axis: any) => {
            if (!axis) {
                return {
                    visible: false,
                };
            }

            const opposite = get(axis, "opposite", false);
            const axisPropsKey = opposite ? "secondary_xAxisProps" : "xAxisProps";
            const className: string = cx({
                "gd-axis-label-drilling-disabled": forceDisableDrillOnAxes,
            });

            const min = get(chartOptions, axisPropsKey.concat(".min"), "");
            const max = get(chartOptions, axisPropsKey.concat(".max"), "");

            const maxProp = max ? { max: Number(max) } : {};
            const minProp = min ? { min: Number(min) } : {};

            const isViewByTwoAttributes = get(chartOptions, "isViewByTwoAttributes", false);
            const visible = get(chartOptions, axisPropsKey.concat(".visible"), true);
            const rotation = get(chartOptions, axisPropsKey.concat(".rotation"), "auto");
            const rotationProp = rotation !== "auto" ? { rotation: -Number(rotation) } : {};

            const shouldCheckForEmptyCategories = isScatterPlot(type) || isBubbleChart(type) ? false : true;
            const labelsEnabled = areAxisLabelsEnabled(
                chartOptions,
                axisPropsKey,
                shouldCheckForEmptyCategories,
            );

            const tickConfiguration = getXAxisTickConfiguration(chartOptions);

            // for bar chart take y axis options
            return {
                ...getAxisLineConfiguration(type, visible),

                // hide ticks on x axis
                minorTickLength: 0,
                tickLength: 0,

                // padding of maximum value
                maxPadding: 0.05,

                labels: {
                    ...labelsEnabled,
                    style: {
                        color: styleVariables.gdColorStateBlank,
                        font: '12px Avenir, "Helvetica Neue", Arial, sans-serif',
                    },
                    autoRotation: [-90],
                    ...rotationProp,
                },
                title: {
                    // should disable X axis title when 'View By 2 attributes'
                    enabled: visible && !isViewByTwoAttributes,
                    margin: 10,
                    style: {
                        textOverflow: "ellipsis",
                        color: styleVariables.gdColorLink,
                        font: '14px Avenir, "Helvetica Neue", Arial, sans-serif',
                    },
                },
                className,
                ...maxProp,
                ...minProp,
                ...tickConfiguration,
            };
        }),
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

export function getCustomizedConfiguration(
    chartOptions: IChartOptions,
    chartConfig?: IChartConfig,
    drillConfig?: IDrillConfig,
    intl?: IntlShape,
): any {
    const configurators = [
        getAxesConfiguration,
        getTitleConfiguration,
        getStackingConfiguration,
        hideOverlappedLabels,
        getShowInPercentConfiguration,
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
        getChartAlignmentConfiguration,
        getAxisLabelConfigurationForDualBarChart,
        getTargetCursorConfigurationForBulletChart,
    ];

    const commonData = configurators.reduce((config: any, configurator: any) => {
        return merge(config, configurator(chartOptions, config, chartConfig, drillConfig, intl));
    }, {});

    return merge({}, commonData);
}
