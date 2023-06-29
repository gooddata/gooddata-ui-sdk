// (C) 2007-2023 GoodData Corporation
import invoke from "lodash/invoke.js";
import isEmpty from "lodash/isEmpty.js";
import set from "lodash/set.js";
import { IDrillConfig, ChartType } from "@gooddata/sdk-ui";
import { IHighchartsAxisExtend } from "../../typings/extend.js";
import { styleVariables } from "./styles/variables.js";
import { isOneOfTypes } from "../_util/common.js";
import { chartClick } from "./drilldownEventing.js";
import { setupDrilldown } from "./setupDrilldownToParentAttribute.js";
import Highcharts from "../../lib/index.js";
import { supportedDualAxesChartTypes } from "../_chartOptions/chartCapabilities.js";
import { IChartOptions } from "../../typings/unsafe.js";
import { ITheme } from "@gooddata/sdk-model";

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const HIGHCHART_PLOT_LIMITED_RANGE = 1e5;

export const DEFAULT_SERIES_LIMIT = 1000;
export const DEFAULT_CATEGORIES_LIMIT = 3000;
export const DEFAULT_DATA_POINTS_LIMIT = 2000;
export const MAX_POINT_WIDTH = 100;
export const HOVER_BRIGHTNESS = 0.1;
export const MINIMUM_HC_SAFE_BRIGHTNESS = Number.MIN_VALUE;

function handleTooltipOffScreen(renderTo: Highcharts.HTMLDOMElement) {
    // allow tooltip over the container wrapper
    Highcharts.css(renderTo, { overflow: "visible" });
}

function fixNumericalAxisOutOfMinMaxRange(axis: IHighchartsAxisExtend) {
    const range: number = axis.max - axis.min;
    if (range < 0) {
        // all data points is outside
        axis.translationSlope = axis.transA = HIGHCHART_PLOT_LIMITED_RANGE;
    }
}

let previousChart: any = null;

function getThemedConfiguration(theme: ITheme): any {
    // This way it is possible to rewrite css variables in the limited scope.
    const themedBackground = `var(--gd-chart-backgroundColor, var(--gd-palette-complementary-0, ${styleVariables.gdColorBackground}))`;
    const backgroundColor = theme ? themedBackground : styleVariables.gdColorBackground;
    const axisLineColor =
        theme?.chart?.axisColor ?? theme?.palette?.complementary?.c4 ?? styleVariables.gdColorAxisLine;

    return {
        credits: {
            enabled: false,
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
                color: theme?.palette?.complementary?.c9 ?? "#000",
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
                dataLabels: {
                    style: {
                        textOutline: "none",
                    },
                },
                events: {
                    legendItemClick() {
                        if (this.visible) {
                            this.points.forEach((point: any) => point.dataLabel?.hide());
                        }
                    },
                },
                point: {
                    events: {
                        click() {
                            if (isTouchDevice) {
                                // Close opened tooltip on previous clicked chart
                                // (click between multiple charts on dashboards)
                                const currentChart = this.series.chart;
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
                        },
                    },
                },
            },
        },
        chart: {
            animation: false,
            backgroundColor,
            style: {
                fontFamily: 'gdcustomfont, Avenir, "Helvetica Neue", Arial, sans-serif',
            },
            events: {
                afterGetContainer() {
                    handleTooltipOffScreen(this.renderTo);
                },
            },
        },
        xAxis: [
            {
                lineColor: axisLineColor,
                events: {
                    afterSetAxisTranslation() {
                        fixNumericalAxisOutOfMinMaxRange(this);
                    },
                },
            },
        ],
        yAxis: [
            {
                lineColor: axisLineColor,
            },
        ],
    };
}

function registerDrilldownHandler(configuration: any, chartOptions: any, drillConfig: IDrillConfig) {
    set(
        configuration,
        "chart.events.drilldown",
        function chartDrilldownHandler(event: Highcharts.DrilldownEventObject) {
            chartClick(drillConfig, event, this.container, chartOptions.type);
        },
    );

    return configuration;
}

export function handleChartLoad(chartType: ChartType) {
    return function (): void {
        if (!this.hasLoaded) {
            // setup drill on initial render
            setupDrilldown(this, chartType);
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
): any {
    const commonConfiguration = getThemedConfiguration(theme);

    const handlers = [registerDrilldownHandler, registerRenderHandler];

    return handlers.reduce(
        (configuration, handler) => handler(configuration, chartOptions, drillConfig),
        commonConfiguration,
    );
}
