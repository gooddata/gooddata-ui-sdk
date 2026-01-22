// (C) 2007-2026 GoodData Corporation

import {
    type CSSProperties,
    type ReactElement,
    type ReactNode,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import * as jsYaml from "js-yaml";
import { isEqual, partial, set, throttle } from "lodash-es";
import { type ContentRect, type Rect } from "react-measure";
import { v4 } from "uuid";

import { type ITheme } from "@gooddata/sdk-model";
import { LoadingComponent, VisualizationTypes } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger, IconUndo } from "@gooddata/sdk-ui-kit";
import {
    type ILegendDetailOptions,
    type ILegendOptions,
    type ILegendProps,
    Legend,
    type PositionType,
    getLegendDetails,
} from "@gooddata/sdk-ui-vis-commons";

import { Chart, type IChartProps } from "./Chart.js";
import { mergePropertiesWithOverride } from "./propertyMerger.js";
import { type IChartConfig } from "../../interfaces/chartConfig.js";
import { type OnLegendReady } from "../../interfaces/chartProps.js";
import { alignChart } from "../chartTypes/_chartCreators/helpers.js";
import {
    isFunnel,
    isHeatmap,
    isOneOfTypes,
    isPieOrDonutChart,
    isSankeyOrDependencyWheel,
    isWaterfall,
} from "../chartTypes/_util/common.js";
import { type HChart, type HighchartsOptions, type XAxisOptions, type YAxisOptions } from "../lib/index.js";
import { BOTTOM, LEFT, RIGHT, TOP } from "../typings/mess.js";
import { type IChartOptions, type ISeriesDataItem, type ISeriesItem } from "../typings/unsafe.js";

/**
 * @internal
 */
export const FLUID_LEGEND_THRESHOLD = 768;

export interface IChartHTMLElement extends HTMLElement {
    getChart(): HChart;

    getHighchartRef(): HTMLElement;
}

/**
 * @internal
 */
export interface IHighChartsRendererProps {
    chartOptions: IChartOptions;
    hcOptions: HighchartsOptions;
    documentObj?: Document | null;
    height?: number | null;
    width?: number;
    legend?: ILegendOptions;
    locale?: string;
    theme?: ITheme;
    onLegendReady?: OnLegendReady;
    legendRenderer?: (legendProps: ILegendProps) => any;
    chartRenderer?: (chartProps: IChartProps) => any;
    afterRender?: () => void;
    resetZoomButtonTooltip?: string | null;
    contentRect?: ContentRect;
    config?: IChartConfig;
}

export interface IHighChartsRendererState {
    legendItemsEnabled: boolean[];
    showFluidLegend: boolean;
}

export interface ILegendDetails {
    name?: string;
    position: PositionType;
    maxRows?: number;
    renderPopUp?: boolean;
}

export function renderChart(props: IChartProps): ReactElement {
    return <Chart {...props} />;
}

export function renderLegend(props: ILegendProps): ReactElement {
    return <Legend {...props} />;
}

function getFlexDirection(position: string): CSSProperties["flexDirection"] {
    if (position === TOP || position === BOTTOM) {
        return "column";
    }

    return "row";
}

function skipLeadingZeros(values: ISeriesDataItem[]) {
    const result = [...values];

    while (result[0]?.y === 0) {
        result.shift();
    }

    return result;
}

const highchartsStyle = { flex: "1 1 auto", position: "relative", overflow: "hidden" } as const;

const defaultLegend: ILegendOptions = {
    enabled: true,
    toggleEnabled: false,
    responsive: false,
    position: RIGHT as PositionType,
    format: "",
    items: [],
};

const defaultDocumentObj = typeof document === "undefined" ? null : document;

export const HighChartsRenderer = memo(function HighChartsRenderer({
    chartOptions,
    hcOptions,
    documentObj = defaultDocumentObj,
    height = null,
    legend: legendProp,
    locale,
    theme,
    onLegendReady = () => {},
    legendRenderer = renderLegend,
    chartRenderer = renderChart,
    afterRender = () => {},
    resetZoomButtonTooltip,
    contentRect,
    config,
}: IHighChartsRendererProps): ReactElement | null {
    const legend: ILegendOptions = legendProp ?? defaultLegend;

    const highchartsRendererRef = useRef<HTMLDivElement>(null); // whole component = legend + chart
    const chartRef = useRef<IChartHTMLElement>(null);
    const containerId = useMemo(() => `visualization-${v4()}`, []);

    const shouldShowFluid = useCallback((): boolean => {
        return (
            (documentObj?.documentElement?.clientWidth ?? 0) < FLUID_LEGEND_THRESHOLD &&
            legend?.responsive !== "autoPositionWithPopup"
        );
    }, [documentObj, legend?.responsive]);

    const [legendItemsEnabled, setLegendItemsEnabled] = useState<boolean[]>(() => {
        // Initialize with proper array size on first render (equivalent to UNSAFE_componentWillMount)
        const legendItemsCount = legend?.items?.length ?? 0;
        return new Array(legendItemsCount).fill(true);
    });
    const [showFluidLegend, setShowFluidLegend] = useState<boolean>(shouldShowFluid());

    const realignPieOrDonutChart = useCallback(() => {
        const { type, verticalAlign } = chartOptions;

        if (isPieOrDonutChart(type) && chartRef.current) {
            alignChart(chartRef.current.getChart(), verticalAlign);
        }
    }, [chartOptions]);

    const onWindowResize = useCallback((): void => {
        setShowFluidLegend(shouldShowFluid());

        realignPieOrDonutChart();
    }, [shouldShowFluid, realignPieOrDonutChart]);

    const throttledOnWindowResize = useMemo(() => throttle(onWindowResize, 100), [onWindowResize]);

    const resetLegendState = useCallback((legendItems: any[] | undefined) => {
        const legendItemsCount = legendItems?.length ?? 0;
        setLegendItemsEnabled(new Array(legendItemsCount).fill(true));
    }, []);

    const onLegendItemClick = useCallback((item: any): void => {
        if (item.anomaly) {
            return;
        }
        setLegendItemsEnabled((prev) => set<boolean[]>([...prev], item.legendIndex, !prev[item.legendIndex]));
    }, []);

    const getItems = useCallback(
        (items: any[]): any[] => {
            return items.map((i) => {
                return {
                    name: i.name,
                    color: i.color,
                    onClick: partial(onLegendItemClick, i),
                };
            });
        },
        [onLegendItemClick],
    );

    const setChartRefCallback = useCallback((ref: IChartHTMLElement): void => {
        chartRef.current = ref;
    }, []);

    const onChartSelection = useCallback((event: any): undefined => {
        const chartWrapper = event.target.renderTo.parentElement;
        const resetZoomButton = chartWrapper.querySelector(".viz-zoom-out");
        if (event.resetSelection) {
            resetZoomButton.style.display = "none";
        } else {
            resetZoomButton.style.display = "grid";
        }

        return undefined;
    }, []);

    const createChartConfig = useCallback(
        (chartConfig: HighchartsOptions, legendItemsEnabledArr: any[]): HighchartsOptions => {
            const { series, chart, xAxis, yAxis } = chartConfig;

            const selectionEvent = chart?.zooming?.type
                ? {
                      selection: onChartSelection,
                  }
                : {};

            const firstSeriesTypes = [
                VisualizationTypes.PIE,
                VisualizationTypes.DONUT,
                VisualizationTypes.TREEMAP,
                VisualizationTypes.FUNNEL,
                VisualizationTypes.PYRAMID,
                VisualizationTypes.SCATTER,
            ];
            const multipleSeries = isOneOfTypes(chart?.type, firstSeriesTypes);

            let items: any[] = isOneOfTypes(chart?.type, firstSeriesTypes)
                ? (series?.[0] as any)?.data
                : series;

            if (isFunnel(chart?.type)) {
                items = skipLeadingZeros(items).filter((i) => !(i.y === null || i.y === undefined));
            }

            const updatedItems = items.map((item: any) => {
                const itemIndex = item.legendIndex;
                const visible =
                    legendItemsEnabledArr[itemIndex] === undefined ? true : legendItemsEnabledArr[itemIndex];
                return {
                    ...item,
                    visible: item.visible === null || item.visible === undefined ? visible : item.visible,
                };
            });

            let updatedSeries = updatedItems;
            if (multipleSeries) {
                updatedSeries = [
                    {
                        ...series?.[0],
                        data: updatedItems,
                    },
                    ...(series?.slice(1) ?? []),
                ];
            }

            return {
                ...chartConfig,
                chart: {
                    ...chartConfig?.chart,
                    events: {
                        ...chartConfig?.chart?.events,
                        ...selectionEvent,
                    },
                },
                series: updatedSeries,
                yAxis: (yAxis as any).map((ax: YAxisOptions) => ({
                    ...ax,
                    title: {
                        ...ax?.title,
                        style: {
                            ...ax?.title?.style,
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        },
                    },
                })),
                // perform a shallow copy of axis
                // (otherwise there's a highcharts internal error on smallest responsive charts)
                xAxis: (xAxis as any).map((ax: XAxisOptions) => ({
                    ...ax,
                })),
            };
        },
        [onChartSelection],
    );

    const getHighChartsConfigOverride = useCallback((): Partial<HighchartsOptions> | undefined => {
        try {
            // YAML value was automatically merged from visualization properties to chart config from where
            // we will load it now and transform to JSON, expecting that it contains valid partial
            // HighChart configuration.
            const rawConfigOverride = config?.chartConfigOverride;

            if (rawConfigOverride) {
                return jsYaml.load(rawConfigOverride) as Partial<HighchartsOptions>;
            }
            return undefined;
        } catch (e) {
            console.error("Visualization properties contains invalid HighCharts config override", e);
            return undefined;
        }
    }, [config?.chartConfigOverride]);

    const doAfterChartRender = useCallback(
        (chart?: HChart): void => {
            try {
                // Ensure we only manipulate the container when chart is fully available
                if (chart?.container?.style) {
                    chart.container.style.height = (height && String(height)) || "100%";
                    chart.container.style.position = height ? "relative" : "absolute";
                    chart.reflow();
                }
            } catch (e) {
                console.error("Post-render sizing failed.", e);
            } finally {
                // Call original afterRender callback if provided
                afterRender?.();
            }
        },
        [height, afterRender],
    );

    const onZoomOutButtonClick = useCallback((): void => {
        chartRef.current?.getChart().zoomOut();
    }, []);

    // componentDidMount equivalent
    useEffect(() => {
        onLegendReady({
            legendItems: getItems(legend.items ?? []),
        });

        window.addEventListener("resize", throttledOnWindowResize);

        return () => {
            throttledOnWindowResize.cancel();
            window.removeEventListener("resize", throttledOnWindowResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // UNSAFE_componentWillReceiveProps equivalent - handle legend items changes
    const previousLegendItemsRef = useRef<any[]>(legend?.items ?? []);
    useEffect(() => {
        const thisLegendItems = previousLegendItemsRef.current;
        const nextLegendItems = legend?.items ?? [];
        const hasLegendChanged = !isEqual(thisLegendItems, nextLegendItems);
        if (hasLegendChanged) {
            resetLegendState(nextLegendItems);
        }

        if (!isEqual(previousLegendItemsRef.current, nextLegendItems)) {
            onLegendReady({
                legendItems: getItems(nextLegendItems),
            });
        }

        previousLegendItemsRef.current = nextLegendItems;
    }, [legend?.items, resetLegendState, onLegendReady, getItems]);

    const renderLegendContent = (
        legendDetails: ILegendDetails,
        contentRectParam: ContentRect | undefined,
        containerIdParam: string,
    ): ReactNode => {
        const { items, format } = legend;

        if (!legend.enabled) {
            return null;
        }

        let { type } = chartOptions;
        if (isPieOrDonutChart(type)) {
            type = VisualizationTypes.PIE;
        }
        const onItemClick =
            isSankeyOrDependencyWheel(type) || isWaterfall(type) ? () => {} : onLegendItemClick;

        const legendProps: ILegendProps = {
            responsive: legend.responsive,
            enableBorderRadius: legend.enableBorderRadius,
            seriesMapper: legend.seriesMapper,
            series: items,
            onItemClick,
            legendItemsEnabled: legendItemsEnabled,
            heatmapLegend: isHeatmap(type),
            height: height as number,
            legendLabel: legendDetails?.name,
            maximumRows: legendDetails?.maxRows,
            position: legendDetails.position,
            format,
            locale,
            showFluidLegend,
            validateOverHeight: () => {},
            contentDimensions: contentRectParam?.client as Rect,
            containerId: containerIdParam,
            chartFill: chartOptions.chartFill?.type,
        };

        return legendRenderer(legendProps);
    };

    const chartConfig = useMemo(
        () => createChartConfig(hcOptions, legendItemsEnabled),
        [createChartConfig, hcOptions, legendItemsEnabled],
    );

    const finalChartConfig = useMemo(
        () =>
            config?.enableVisualizationFineTuning
                ? mergePropertiesWithOverride(chartConfig, getHighChartsConfigOverride())
                : chartConfig,
        [config?.enableVisualizationFineTuning, chartConfig, getHighChartsConfigOverride],
    );

    const renderHighcharts = (): ReactNode => {
        // shrink chart to give space to legend items
        const chartProps = {
            domProps: { className: "viz-react-highchart-wrap gd-viz-highchart-wrap", style: highchartsStyle },
            ref: setChartRefCallback,
            config: finalChartConfig,
            callback: doAfterChartRender,
        };
        return chartRenderer(chartProps as any);
    };

    const renderZoomOutButton = () => {
        const { chart } = hcOptions;

        if (chart?.zooming?.type) {
            return (
                <BubbleHoverTrigger
                    tagName="abbr"
                    hideDelay={100}
                    showDelay={100}
                    className="gd-bubble-trigger-zoom-out"
                >
                    <button
                        className="viz-zoom-out s-zoom-out"
                        onClick={onZoomOutButtonClick}
                        style={{ display: "none" }}
                    >
                        <IconUndo width={20} height={20} color={theme?.palette?.complementary?.c7} />
                    </button>
                    <Bubble alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}>
                        {resetZoomButtonTooltip}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }
        return null;
    };

    const renderLoading = () => {
        const container = highchartsRendererRef.current;
        const { data } = chartOptions;

        const loading: ISeriesItem[] =
            data?.series?.filter((series: ISeriesItem) => {
                return series.data?.some((seriesData?: ISeriesDataItem) => seriesData?.loading);
            }) ?? [];

        if (!loading.length || !container) {
            return null;
        }

        const loadingSeries = loading.reduce<number[]>((loadingSeriesArr: number[], series: ISeriesItem) => {
            if (series?.legendIndex && !loadingSeriesArr.includes(series.legendIndex)) {
                loadingSeriesArr.push(series.legendIndex);
            }
            return loadingSeriesArr;
        }, []);
        const containerRect = container.getBoundingClientRect();

        const elements: ReactNode[] = [];
        for (let i = 0; i < loadingSeries.length; i++) {
            const el = container.querySelector(`.highcharts-series.highcharts-series-${loadingSeries[i]}`);
            if (el) {
                const rect = el.getBoundingClientRect();
                elements.push(
                    <div
                        key={i}
                        className="gd-chart-forecasting"
                        style={{
                            width: containerRect.left + containerRect.width - (rect.left + rect.width),
                            left: rect.left + rect.width - containerRect.left,
                        }}
                    >
                        <div className="gd-chart-forecasting-background" />
                        <LoadingComponent />
                    </div>,
                );
            }
        }

        return elements;
    };

    const renderVisualization = () => {
        const legendDetailOptions: ILegendDetailOptions = {
            showFluidLegend: showFluidLegend,
            contentRect,
            isHeatmap: isHeatmap(chartOptions.type),
            legendLabel: chartOptions.legendLabel,
        };
        const legendDetails = getLegendDetails(
            legend.position,
            legend.responsive!,
            legendDetailOptions,
            config?.respectLegendPosition,
        );
        if (!legendDetails) {
            return null;
        }

        const classes = cx(
            "viz-line-family-chart-wrap",
            "s-viz-line-family-chart-wrap",
            legend.responsive === true ? "responsive-legend" : "non-responsive-legend",
            {
                [`flex-direction-${getFlexDirection(legendDetails.position)}`]: true,
                "legend-position-bottom": legendDetails.position === BOTTOM,
            },
            containerId,
        );

        const legendPosition = legendDetails.position;
        const isLegendRenderedFirst: boolean =
            legendPosition === TOP || legendPosition === LEFT || showFluidLegend;

        return (
            <div className={classes} ref={highchartsRendererRef}>
                {renderZoomOutButton()}
                {isLegendRenderedFirst ? renderLegendContent(legendDetails, contentRect, containerId) : null}
                {renderHighcharts()}
                {isLegendRenderedFirst ? null : renderLegendContent(legendDetails, contentRect, containerId)}
                {renderLoading()}
            </div>
        );
    };

    return renderVisualization();
});
