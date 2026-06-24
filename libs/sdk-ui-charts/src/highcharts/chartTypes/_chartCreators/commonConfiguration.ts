// (C) 2007-2026 GoodData Corporation

import Highcharts from "highcharts/esm/highcharts.js";
import { invoke, isEmpty, set } from "lodash-es";

import { type ITheme } from "@gooddata/sdk-model";
import { type ChartType, type IDrillConfig } from "@gooddata/sdk-ui";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import {
    getBackplateLabelColor,
    getBackplateStackedLabelStyling,
    getBlackLabelStyle,
    getBlackStackedLabelStyle,
} from "../../constants/label.js";
import { DEFAULT_CATEGORIES_LIMIT } from "../../constants/limits.js";
import { type DrilldownEventObject, type HTMLDOMElement, type Point } from "../../lib/index.js";
import { type IHighchartsAxisExtend } from "../../typings/extend.js";
import { type IChartOptions, type UnsafeInternals } from "../../typings/unsafe.js";
import { isHighContrastMode } from "../../utils/highContrastMode.js";
import { supportedDualAxesChartTypes } from "../_chartOptions/chartCapabilities.js";
import { formatValueForTooltip } from "../_chartOptions/tooltip.js";
import { isOneOfTypes } from "../_util/common.js";

import { chartClick } from "./drilldownEventing.js";
import { setupDrilldown } from "./setupDrilldownToParentAttribute.js";
import { styleVariables } from "./styles/variables.js";

const isTouchDevice =
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
const HIGHCHART_PLOT_LIMITED_RANGE = 1e5;

export const MAX_POINT_WIDTH = 100;
export const HOVER_BRIGHTNESS = 0.1;
export const MINIMUM_HC_SAFE_BRIGHTNESS = Number.MIN_VALUE;

function handleTooltipOffScreen(renderTo: HTMLDOMElement) {
    // allow tooltip over the container wrapper
    Highcharts.css(renderTo, { overflow: "visible" });
}

function fixNumericalAxisOutOfMinMaxRange(axis: IHighchartsAxisExtend) {
    const range: number = axis.max! - axis.min!;
    if (range < 0) {
        // all data points is outside
        axis.translationSlope = axis.transA = HIGHCHART_PLOT_LIMITED_RANGE;
    }
}

let previousChart: any = null;

function getBackgroundColor(theme: ITheme | undefined): string {
    // This way it is possible to rewrite css variables in the limited scope.
    const themedBackground = `var(--gd-chart-backgroundColor, var(--gd-palette-complementary-0, ${styleVariables.gdColorBackground}))`;
    return theme ? themedBackground : styleVariables.gdColorBackground;
}

function getAxisLineColor(theme: ITheme | undefined): string {
    return (
        theme?.chart?.axisColor ??
        theme?.chart?.axis?.color ??
        theme?.palette?.complementary?.c4 ??
        styleVariables.gdColorAxisLine
    );
}

function getActiveDataLabelColor(
    isHighContrast: boolean,
    isBackplateStyle: boolean,
    theme: ITheme | undefined,
): string {
    if (isHighContrast) {
        return "CanvasText";
    }
    if (isBackplateStyle) {
        return getBackplateLabelColor(theme);
    }
    // color is guaranteed to be defined because as return value of getBlackLabelStyle
    return getBlackLabelStyle(theme).color!;
}

function getStackLabelsConfig(isBackplateStyle: boolean, theme: ITheme | undefined): any {
    return isBackplateStyle
        ? getBackplateStackedLabelStyling(theme)
        : { style: getBlackStackedLabelStyle(theme) };
}

function handleTouchDeviceClick(context: any): void {
    // Close opened tooltip on previous clicked chart
    // (click between multiple charts on dashboards)
    const currentChart = context.series.chart;
    const currentId = currentChart?.container?.id;
    const prevId = previousChart?.container?.id;
    const previousChartDisconnected = isEmpty(previousChart);

    if (previousChart && !previousChartDisconnected && prevId !== currentId) {
        // Remove line chart point bubble
        invoke(previousChart, "hoverSeries.onMouseOut");
        previousChart.tooltip.hide();
    }

    if (!previousChart || prevId !== currentId) {
        previousChart = currentChart;
    }
}

function decodeHtmlEntities(str: string): string {
    return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function getThemedConfiguration(
    theme: ITheme | undefined,
    config?: IChartConfig,
    chartOptions?: IChartOptions,
): any {
    // Check if Windows High Contrast Mode is active
    const isHighContrast = isHighContrastMode();
    const backgroundColor = getBackgroundColor(theme);
    const axisLineColor = getAxisLineColor(theme);
    const isBackplateStyle = config?.dataLabels?.style === "backplate";

    const stackByTitle = decodeHtmlEntities(
        chartOptions?.hasStackByAttribute ? (chartOptions?.legendLabel ?? "") : "",
    );
    const viewByTitle = decodeHtmlEntities(
        chartOptions?.hasStackByAttribute ? "" : (chartOptions?.legendLabel ?? ""),
    );
    const measureName = decodeHtmlEntities(chartOptions?.yAxes?.[0]?.label ?? "");

    return {
        credits: {
            enabled: false,
        },
        accessibility: {
            enabled: config?.enableHighchartsAccessibility ?? true,
            point: {
                descriptionFormatter: (point: Point): string => {
                    const anyPoint = point as UnsafeInternals;
                    const xAxisTitle: string = decodeHtmlEntities(
                        anyPoint.series?.xAxis?.axisTitle?.textStr ?? "",
                    );
                    const rawCategory = anyPoint.category;
                    const category: string = decodeHtmlEntities(
                        typeof rawCategory === "object" && rawCategory?.name
                            ? rawCategory.name
                            : typeof rawCategory === "string"
                              ? rawCategory
                              : "",
                    );
                    const seriesName: string = decodeHtmlEntities(point.series.name);
                    const pointName: string = decodeHtmlEntities(anyPoint.name ?? "");
                    // treemaps store the data value in point.value; other charts use point.y
                    const rawValue = anyPoint.value ?? point.y;
                    const yValue: string =
                        formatValueForTooltip(rawValue, anyPoint.format, config?.separators) ??
                        String(rawValue ?? "");

                    // Bubble chart: series type is "bubble"; x/y/z are measures, not categories
                    if (anyPoint.series?.type === "bubble") {
                        const xAxisLabel = decodeHtmlEntities(chartOptions?.xAxes?.[0]?.label ?? "");
                        const yAxisLabel = decodeHtmlEntities(chartOptions?.yAxes?.[0]?.label ?? "");
                        const zAxisLabel = decodeHtmlEntities(chartOptions?.zAxes?.[0]?.label ?? "");
                        const xVal =
                            formatValueForTooltip(
                                anyPoint.x,
                                chartOptions?.xAxes?.[0]?.format,
                                config?.separators,
                            ) ?? String(anyPoint.x ?? "");
                        const yVal =
                            formatValueForTooltip(
                                anyPoint.y,
                                chartOptions?.yAxes?.[0]?.format,
                                config?.separators,
                            ) ?? String(anyPoint.y ?? "");
                        const zVal =
                            formatValueForTooltip(
                                anyPoint.z,
                                chartOptions?.zAxes?.[0]?.format,
                                config?.separators,
                            ) ?? String(anyPoint.z ?? "");

                        // Bubble charts use viewByTitle (hasStackByAttribute is not set for bubble)
                        const attrTitle = stackByTitle || viewByTitle;
                        const namePart = attrTitle && pointName ? `${attrTitle}: ${pointName}` : pointName;

                        const parts: string[] = [];
                        if (namePart) parts.push(namePart);
                        parts.push(xAxisLabel ? `${xAxisLabel}: ${xVal}` : `x: ${xVal}`);
                        // Only include y/z when the measures are actually configured
                        if (yAxisLabel) parts.push(`${yAxisLabel}: ${yVal}`);
                        if (Number.isFinite(anyPoint.z)) {
                            parts.push(zAxisLabel ? `${zAxisLabel}: ${zVal}` : `z: ${zVal}`);
                        }

                        return `${parts.join(", ")}.`;
                    }

                    const xPart = xAxisTitle && category ? `${xAxisTitle}: ${category}` : category;

                    if (xPart) {
                        if (stackByTitle && measureName) {
                            // Stacked: "Department: Direct Sales, Region: East Coast, Won: $8 384 271,02."
                            return `${xPart}, ${stackByTitle}: ${seriesName}, ${measureName}: ${yValue}.`;
                        }
                        return `${xPart}, ${seriesName}: ${yValue}.`;
                    }

                    // For pie/treemap/funnel etc.: point.name is the slice label.
                    // When there is a viewBy, include its title and the measure name.
                    if (pointName) {
                        if (viewByTitle && pointName !== seriesName) {
                            return `${viewByTitle}: ${pointName}, ${seriesName}: ${yValue}.`;
                        }
                        return `${pointName}: ${yValue}.`;
                    }
                    return `${seriesName}: ${yValue}.`;
                },
            },
        },
        title: {
            // setting title to empty string prevents it from being shown
            text: "",
        },
        series: [],
        legend: {
            enabled: false,
        },
        drilldown: {
            activeDataLabelStyle: {
                color: getActiveDataLabelColor(isHighContrast, isBackplateStyle, theme),
                textDecoration: "none",
            },
            activeAxisLabelStyle: {
                color: theme?.palette?.complementary?.c8 ?? styleVariables.gdColorText,
                textDecoration: "none",
            },
            drillUpButton: {
                theme: {
                    style: {
                        // https://forum.highcharts.com/highcharts-usage/empty-checkbox-
                        // after-drilldown-with-x-axis-label-t33414/
                        display: "none",
                    },
                },
            },
        },
        plotOptions: {
            series: {
                animation: false,
                enableMouseTracking: true, // !Status.exportMode,
                turboThreshold: DEFAULT_CATEGORIES_LIMIT,
                borderColor: backgroundColor,
                borderRadius: 0,
                dataLabels: {
                    style: {
                        textOutline: "none",
                        whiteSpace: "nowrap",
                    },
                },
                events: {
                    legendItemClick(this: any) {
                        if (this.visible) {
                            this.points.forEach((point: any) => point.dataLabel?.hide());
                        }
                    },
                },
                point: {
                    events: {
                        click(this: any) {
                            if (isTouchDevice) {
                                handleTouchDeviceClick(this);
                            }
                        },
                    },
                },
            },
        },
        chart: {
            animation: false,
            backgroundColor: isHighContrast ? "Canvas" : backgroundColor,
            style: {
                fontFamily:
                    'var(--gd-font-family, gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif)',
                color: isHighContrast ? "CanvasText" : undefined,
            },
            events: {
                afterGetContainer(this: any) {
                    handleTooltipOffScreen(this.renderTo);
                },
            },
        },
        xAxis: [
            {
                lineColor: axisLineColor,
                events: {
                    afterSetAxisTranslation(this: any) {
                        fixNumericalAxisOutOfMinMaxRange(this);
                    },
                },
            },
        ],
        yAxis: [
            {
                lineColor: axisLineColor,
                stackLabels: getStackLabelsConfig(isBackplateStyle, theme),
            },
        ],
    };
}

function registerDrilldownHandler(configuration: any, chartOptions: any, drillConfig: IDrillConfig) {
    set(
        configuration,
        "chart.events.drilldown",
        function chartDrilldownHandler(this: any, event: DrilldownEventObject) {
            this.tooltip?.hide();
            chartClick(drillConfig, event, this.container, this.id, chartOptions.type);
        },
    );

    return configuration;
}

export function handleChartLoad(chartType: ChartType) {
    return function (this: any): void {
        if (!this.hasLoaded) {
            // setup drill on initial render we need to do in timeout because init of drill down module
            // is registered on the same event and we need to wait for its job to be done
            setTimeout(() => {
                setupDrilldown(this, chartType);
            });
        }
    };
}

function registerRenderHandler(configuration: any, chartOptions: any) {
    if (isOneOfTypes(chartOptions.type, supportedDualAxesChartTypes)) {
        set(configuration, "chart.events.render", handleChartLoad(chartOptions.type));
    }
    return configuration;
}

export function getCommonConfiguration(
    chartOptions: IChartOptions,
    drillConfig: IDrillConfig,
    theme?: ITheme,
    config?: IChartConfig,
): any {
    const commonConfiguration = getThemedConfiguration(theme, config, chartOptions);

    const handlers = [registerDrilldownHandler, registerRenderHandler];

    return handlers.reduce(
        (configuration, handler) => handler(configuration, chartOptions, drillConfig),
        commonConfiguration,
    );
}
