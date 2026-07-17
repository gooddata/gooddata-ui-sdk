// (C) 2007-2026 GoodData Corporation

import Highcharts from "highcharts/esm/highcharts.js";
import { invoke, isEmpty, set } from "lodash-es";
import { type IntlShape } from "react-intl";

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
import { type ICategory, type IChartOptions, type UnsafeInternals } from "../../typings/unsafe.js";
import { isHighContrastMode } from "../../utils/highContrastMode.js";
import { supportedDualAxesChartTypes } from "../_chartOptions/chartCapabilities.js";
import { formatValueForTooltip } from "../_chartOptions/tooltip.js";
import { decodeHtmlEntities, isOneOfTypes } from "../_util/common.js";

import { chartClick } from "./drilldownEventing.js";
import { setupDrilldown } from "./setupDrilldownToParentAttribute.js";
import { styleVariables } from "./styles/variables.js";

const isTouchDevice =
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
const HIGHCHART_PLOT_LIMITED_RANGE = 1e5;

// Keyed by the chart container element; avoids expando properties on DOM nodes.
const stackKeyHandlers = new WeakMap<HTMLElement, (e: KeyboardEvent) => void>();
const stackKeyDestroyRegistered = new WeakSet<HTMLElement>();

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

function stackLabelKey(xIdx: number, isNegative: boolean): string {
    return `${xIdx}:${isNegative ? "neg" : "pos"}`;
}

function processStackLabelAccessibility(
    chart: any,
    chartOptions: IChartOptions | undefined,
    config: IChartConfig | undefined,
    intl: IntlShape | undefined,
): void {
    const yAxes: any[] = chart.yAxis ?? [];
    const xCategories = chart.xAxis?.[0]?.categories as Array<string | ICategory> | undefined;
    const xTitle = decodeHtmlEntities(chartOptions?.xAxes?.[0]?.label ?? "");
    const totalLabel = intl?.formatMessage({ id: "visualization.stackLabel.aria.total" }) ?? "total";

    const stackLabelsByAxis = new Map<number, Map<string, HTMLElement>>();

    yAxes.forEach((yAxis: any, axisIndex: number) => {
        if (!yAxis?.stacking?.stacks) return;

        const totalFormat = chartOptions?.yAxes?.[axisIndex]?.format;
        const processed = new Set<string>();
        const stackLabelsByX = new Map<string, HTMLElement>();

        Object.values(yAxis.stacking.stacks).forEach((stackByX: any) => {
            Object.values(stackByX).forEach((stackItem: any) => {
                const xIdx: number = stackItem.x;
                const isNegative: boolean = Boolean(stackItem.isNegative);
                const key = stackLabelKey(xIdx, isNegative);
                if (processed.has(key)) return;
                processed.add(key);

                const labelEl = stackItem.label?.element as HTMLElement | undefined;
                if (!labelEl) return;

                const rawCategory = xCategories?.[xIdx];
                let categoryPart: string;
                if (
                    rawCategory != null &&
                    typeof rawCategory === "object" &&
                    rawCategory.parent?.name != null
                ) {
                    const titleParts = xTitle.split(" › ");
                    const parentVal = decodeHtmlEntities(rawCategory.parent.name);
                    const childVal = decodeHtmlEntities(rawCategory.name ?? "");
                    if (titleParts.length === 2) {
                        const parentTitle = decodeHtmlEntities(titleParts[0] ?? "");
                        const childTitle = decodeHtmlEntities(titleParts[1] ?? "");
                        const parentPart = parentTitle ? `${parentTitle}: ${parentVal}` : parentVal;
                        const childPart = childTitle ? `${childTitle}: ${childVal}` : childVal;
                        categoryPart = [parentPart, childPart].filter(Boolean).join(", ");
                    } else {
                        categoryPart = [parentVal, childVal].filter(Boolean).join(" › ");
                    }
                } else {
                    const categoryStr =
                        rawCategory == null
                            ? String(xIdx)
                            : typeof rawCategory === "object"
                              ? decodeHtmlEntities(rawCategory.name ?? String(xIdx))
                              : decodeHtmlEntities(String(rawCategory));
                    categoryPart = xTitle ? `${xTitle}: ${categoryStr}` : categoryStr;
                }

                const total: number = stackItem.total;
                const formattedTotal =
                    total == null
                        ? ""
                        : (formatValueForTooltip(total, totalFormat, config?.separators) ?? String(total));

                labelEl.setAttribute("tabindex", "-1");
                labelEl.setAttribute("role", "img");
                labelEl.setAttribute("aria-label", `${categoryPart}, ${totalLabel}: ${formattedTotal}.`);
                labelEl.setAttribute("data-x-index", String(xIdx));
                labelEl.setAttribute("data-axis-index", String(axisIndex));
                labelEl.setAttribute("data-stack-sign", isNegative ? "neg" : "pos");
                // Prevent the inner <text> from being read separately by screen readers.
                const textEl = labelEl.querySelector("text");
                if (textEl) textEl.setAttribute("aria-hidden", "true");

                stackLabelsByX.set(key, labelEl);
            });
        });

        if (stackLabelsByX.size > 0) {
            stackLabelsByAxis.set(axisIndex, stackLabelsByX);
        }
    });

    setupStackKeyboardNavigation(chart, stackLabelsByAxis);
}

function setupStackKeyboardNavigation(
    chart: any,
    stackLabelsByAxis: Map<number, Map<string, HTMLElement>>,
): void {
    const container = chart.container as HTMLElement | undefined;
    if (!container) return;

    const prevHandler = stackKeyHandlers.get(container);
    if (prevHandler) {
        container.removeEventListener("keydown", prevHandler as EventListener, true);
        stackKeyHandlers.delete(container);
    }

    if (!stackKeyDestroyRegistered.has(container)) {
        stackKeyDestroyRegistered.add(container);
        (Highcharts as any).addEvent(chart, "destroy", () => {
            const current = stackKeyHandlers.get(container);
            if (current) {
                container.removeEventListener("keydown", current as EventListener, true);
                stackKeyHandlers.delete(container);
            }
        });
    }

    if (stackLabelsByAxis.size === 0) {
        return;
    }

    const findStackedSeriesIdx = (
        startIdx: number,
        direction: 1 | -1,
        yAxis: any,
        xIdx: number,
        isNegative: boolean,
    ): number => {
        const series: any[] = chart.series ?? [];
        for (let i = startIdx; i >= 0 && i < series.length; i += direction) {
            const point = series[i]?.points?.[xIdx];
            if (
                series[i].visible &&
                series[i].yAxis === yAxis &&
                Boolean(series[i].options?.stacking) &&
                point &&
                !point.isNull &&
                point.graphic?.element &&
                (point.y ?? 0) < 0 === isNegative
            ) {
                return i;
            }
        }
        return -1;
    };

    const getEffectiveReversedStacks = (yAxis: any): boolean => yAxis?.options?.reversedStacks ?? true;

    const getTopVisibleSeriesIdxForAxisAndSign = (yAxis: any, xIdx: number, isNegative: boolean): number =>
        getEffectiveReversedStacks(yAxis)
            ? findStackedSeriesIdx(0, 1, yAxis, xIdx, isNegative)
            : findStackedSeriesIdx((chart.series ?? []).length - 1, -1, yAxis, xIdx, isNegative);

    const handler = (e: KeyboardEvent): void => {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

        const focused = document.activeElement as HTMLElement | null;
        if (!focused || !container.contains(focused)) return;

        // ── Focused on a stack total label ──────────────────────────────
        if (
            focused.hasAttribute("data-x-index") &&
            focused.hasAttribute("data-axis-index") &&
            focused.hasAttribute("data-stack-sign")
        ) {
            const xIdx = parseInt(focused.getAttribute("data-x-index")!, 10);
            const axisIdx = parseInt(focused.getAttribute("data-axis-index")!, 10);
            const isNegative = focused.getAttribute("data-stack-sign") === "neg";
            const axisLabels = stackLabelsByAxis.get(axisIdx);

            if (e.key === "ArrowDown") {
                // Descend into the topmost visible segment of this column.
                // point.highlight() draws the focus border AND sets chart.highlightedPoint,
                // which is what Highcharts reads as the current position for subsequent
                // arrow-key navigation. setFocusToElement alone leaves highlightedPoint stale.
                const topIdx = getTopVisibleSeriesIdxForAxisAndSign(chart.yAxis?.[axisIdx], xIdx, isNegative);
                const targetPoint = topIdx >= 0 ? chart.series?.[topIdx]?.points?.[xIdx] : undefined;
                if (targetPoint?.highlight) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    targetPoint.highlight();
                }
            } else if (e.key === "ArrowLeft") {
                const prev = axisLabels?.get(stackLabelKey(xIdx - 1, isNegative));
                if (prev) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    prev.focus();
                }
            } else if (e.key === "ArrowRight") {
                const next = axisLabels?.get(stackLabelKey(xIdx + 1, isNegative));
                if (next) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    next.focus();
                }
            }
            return;
        }

        if (
            (e.key === "ArrowUp" || e.key === "ArrowDown") &&
            focused.classList.contains("highcharts-point")
        ) {
            let focusedSeriesIdx = -1;
            let focusedPointIdx = -1;

            chart.series?.forEach((series: any, si: number) => {
                series.points?.forEach((point: any, pi: number) => {
                    if (point.graphic?.element === focused) {
                        focusedSeriesIdx = si;
                        focusedPointIdx = pi;
                    }
                });
            });

            if (focusedSeriesIdx === -1) return; // couldn't identify the point
            if (!chart.series?.[focusedSeriesIdx]?.options?.stacking) return;

            const focusedAxis = chart.series?.[focusedSeriesIdx]?.yAxis;
            const focusedPoint = chart.series?.[focusedSeriesIdx]?.points?.[focusedPointIdx];
            const focusedIsNegative = (focusedPoint?.y ?? 0) < 0;

            if (e.key === "ArrowUp") {
                if (
                    focusedSeriesIdx ===
                    getTopVisibleSeriesIdxForAxisAndSign(focusedAxis, focusedPointIdx, focusedIsNegative)
                ) {
                    const axisIdx = chart.yAxis?.indexOf(focusedAxis);
                    const stackLabel =
                        axisIdx != null && axisIdx >= 0
                            ? stackLabelsByAxis
                                  .get(axisIdx)
                                  ?.get(stackLabelKey(focusedPointIdx, focusedIsNegative))
                            : undefined;
                    if (stackLabel) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        chart.series?.[focusedSeriesIdx]?.points?.[focusedPointIdx]?.setState?.("");
                        chart.focusElement?.removeFocusBorder?.();
                        delete chart.focusElement;
                        stackLabel.focus();
                    }
                } else {
                    const towardTop = getEffectiveReversedStacks(focusedAxis) ? -1 : 1;
                    const nextIdx = findStackedSeriesIdx(
                        focusedSeriesIdx + towardTop,
                        towardTop,
                        focusedAxis,
                        focusedPointIdx,
                        focusedIsNegative,
                    );
                    const nextPoint =
                        nextIdx >= 0 ? chart.series?.[nextIdx]?.points?.[focusedPointIdx] : undefined;
                    if (nextPoint?.highlight) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                        nextPoint.highlight();
                    }
                }
            } else {
                const towardBottom = getEffectiveReversedStacks(focusedAxis) ? 1 : -1;
                const prevIdx = findStackedSeriesIdx(
                    focusedSeriesIdx + towardBottom,
                    towardBottom,
                    focusedAxis,
                    focusedPointIdx,
                    focusedIsNegative,
                );
                const prevPoint =
                    prevIdx >= 0 ? chart.series?.[prevIdx]?.points?.[focusedPointIdx] : undefined;
                if (prevPoint?.highlight) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    prevPoint.highlight();
                }
            }
        }
    };

    stackKeyHandlers.set(container, handler);
    container.addEventListener("keydown", handler as EventListener, true);
}

function getThemedConfiguration(
    theme: ITheme | undefined,
    config?: IChartConfig,
    chartOptions?: IChartOptions,
    intl?: IntlShape,
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
                    if (chartOptions?.actions?.pointDescription) {
                        return chartOptions.actions.pointDescription(point as UnsafeInternals);
                    }

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
                    const parentCategory: string = decodeHtmlEntities(
                        typeof rawCategory === "object" ? (rawCategory?.parent?.name ?? "") : "",
                    );
                    const seriesName: string = decodeHtmlEntities(point.series.name);
                    const pointName: string = decodeHtmlEntities(anyPoint.name ?? "");
                    const yValue: string =
                        formatValueForTooltip(point.y, anyPoint.format, config?.separators) ??
                        String(point.y ?? "");

                    let xPart: string;
                    if (parentCategory && category) {
                        const titleParts = xAxisTitle.split(" › ");
                        xPart =
                            titleParts.length === 2
                                ? `${titleParts[0]}: ${parentCategory}, ${titleParts[1]}: ${category}`
                                : `${parentCategory} › ${category}`;
                    } else {
                        const effectiveXTitle =
                            xAxisTitle ||
                            viewByTitle ||
                            decodeHtmlEntities(chartOptions?.xAxes?.[0]?.label ?? "");
                        xPart = effectiveXTitle && category ? `${effectiveXTitle}: ${category}` : category;
                    }

                    if (xPart) {
                        if (stackByTitle && measureName) {
                            return `${xPart}, ${stackByTitle}: ${seriesName}, ${measureName}: ${yValue}.`;
                        }
                        return `${xPart}, ${seriesName}: ${yValue}.`;
                    }

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
                    // Stack on top of any existing render handlers (addEvent does not replace).
                    (Highcharts as any).addEvent(this, "render", () => {
                        processStackLabelAccessibility(this, chartOptions, config, intl);
                    });
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
    intl?: IntlShape,
): any {
    const commonConfiguration = getThemedConfiguration(theme, config, chartOptions, intl);

    const handlers = [registerDrilldownHandler, registerRenderHandler];

    return handlers.reduce(
        (configuration, handler) => handler(configuration, chartOptions, drillConfig),
        commonConfiguration,
    );
}
