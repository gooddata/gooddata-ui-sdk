// (C) 2007-2023 GoodData Corporation
import React from "react";
import { ContentRect } from "react-measure";
import { v4 } from "uuid";
import set from "lodash/set.js";
import isEqual from "lodash/isEqual.js";
import noop from "lodash/noop.js";
import partial from "lodash/partial.js";
import throttle from "lodash/throttle.js";
import isNil from "lodash/isNil.js";
import cx from "classnames";
import { OnLegendReady } from "../../interfaces/index.js";
import { Chart, IChartProps } from "./Chart.js";
import {
    isFunnel,
    isPieOrDonutChart,
    isOneOfTypes,
    isHeatmap,
    isSankeyOrDependencyWheel,
    isWaterfall,
} from "../chartTypes/_util/common.js";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import Highcharts, { HighchartsOptions, YAxisOptions, XAxisOptions } from "../lib/index.js";
import { alignChart } from "../chartTypes/_chartCreators/helpers.js";
import {
    ILegendProps,
    Legend,
    ILegendOptions,
    PositionType,
    getLegendDetails,
    ILegendDetailOptions,
} from "@gooddata/sdk-ui-vis-commons";
import { Bubble, BubbleHoverTrigger, Icon } from "@gooddata/sdk-ui-kit";
import { BOTTOM, LEFT, RIGHT, TOP } from "../typings/mess.js";
import { ITheme } from "@gooddata/sdk-model";
import { IChartOptions, ISeriesDataItem } from "../typings/unsafe.js";

/**
 * @internal
 */
export const FLUID_LEGEND_THRESHOLD = 768;

export interface IChartHTMLElement extends HTMLElement {
    getChart(): Highcharts.Chart;

    getHighchartRef(): HTMLElement;
}

/**
 * @internal
 */
export interface IHighChartsRendererProps {
    chartOptions: IChartOptions;
    hcOptions: HighchartsOptions;
    documentObj?: Document;
    height: number;
    width: number;
    legend: ILegendOptions;
    locale: string;
    theme?: ITheme;
    onLegendReady: OnLegendReady;
    legendRenderer(legendProps: ILegendProps): any;
    chartRenderer(chartProps: IChartProps): any;
    afterRender(): void;
    resetZoomButtonTooltip?: string;
    contentRect?: ContentRect;
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

export function renderChart(props: IChartProps): JSX.Element {
    return <Chart {...props} />;
}

export function renderLegend(props: ILegendProps): JSX.Element {
    return <Legend {...props} />;
}

export class HighChartsRenderer extends React.PureComponent<
    IHighChartsRendererProps,
    IHighChartsRendererState
> {
    public static defaultProps = {
        afterRender: noop,
        height: null as number,
        legend: {
            enabled: true,
            responsive: false,
            position: RIGHT,
        },
        chartRenderer: renderChart,
        legendRenderer: renderLegend,
        onLegendReady: noop,
        documentObj: document,
    };

    private highchartsRendererRef = React.createRef<HTMLDivElement>(); // whole component = legend + chart
    private chartRef: IChartHTMLElement;
    private containerId: string = `visualization-${v4()}`;

    constructor(props: IHighChartsRendererProps) {
        super(props);

        this.state = {
            legendItemsEnabled: [],
            showFluidLegend: this.shouldShowFluid(),
        };
    }

    public onWindowResize = (): void => {
        this.setState({
            showFluidLegend: this.shouldShowFluid(),
        });

        this.realignPieOrDonutChart();
    };

    private throttledOnWindowResize = throttle(this.onWindowResize, 100);

    public shouldShowFluid(): boolean {
        const { documentObj, legend } = this.props;
        return (
            documentObj.documentElement.clientWidth < FLUID_LEGEND_THRESHOLD &&
            legend?.responsive !== "autoPositionWithPopup"
        );
    }

    public UNSAFE_componentWillMount(): void {
        this.resetLegendState(this.props);
    }

    public componentDidMount(): void {
        // http://stackoverflow.com/questions/18240254/highcharts-width-exceeds-container-div-on-first-load
        setTimeout(() => {
            if (this.chartRef) {
                const chart = this.chartRef.getChart();

                if (chart.container?.style) {
                    chart.container.style.height = (this.props.height && String(this.props.height)) || "100%";
                    chart.container.style.position = this.props.height ? "relative" : "absolute";
                    chart.reflow();
                }
            }
        }, 0);

        this.props.onLegendReady({
            legendItems: this.getItems(this.props.legend.items),
        });

        window.addEventListener("resize", this.throttledOnWindowResize);
    }

    public componentWillUnmount(): void {
        this.throttledOnWindowResize.cancel();
        window.removeEventListener("resize", this.throttledOnWindowResize);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IHighChartsRendererProps): void {
        const thisLegendItems = this.props.legend?.items ?? [];
        const nextLegendItems = nextProps.legend?.items ?? [];
        const hasLegendChanged = !isEqual(thisLegendItems, nextLegendItems);
        if (hasLegendChanged) {
            this.resetLegendState(nextProps);
        }

        if (!isEqual(this.props.legend.items, nextProps.legend.items)) {
            this.props.onLegendReady({
                legendItems: this.getItems(nextProps.legend.items),
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public onLegendItemClick = (item: any): void => {
        this.setState({
            legendItemsEnabled: set<boolean[]>(
                [...this.state.legendItemsEnabled],
                item.legendIndex,
                !this.state.legendItemsEnabled[item.legendIndex],
            ),
        });
    };

    public setChartRef = (chartRef: IChartHTMLElement): void => {
        this.chartRef = chartRef;
    };

    public getFlexDirection(position: string): React.CSSProperties["flexDirection"] {
        if (position === TOP || position === BOTTOM) {
            return "column";
        }

        return "row";
    }

    public getItems(items: any[]): any[] {
        return items.map((i) => {
            return {
                name: i.name,
                color: i.color,
                onClick: partial(this.onLegendItemClick, i),
            };
        });
    }

    public resetLegendState(props: IHighChartsRendererProps): void {
        const legendItemsCount = props.legend?.items?.length ?? 0;
        this.setState({
            legendItemsEnabled: new Array(legendItemsCount).fill(true),
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private onChartSelection = (event: any): undefined => {
        const chartWrapper = event.target.renderTo.parentElement;
        const resetZoomButton = chartWrapper.closest(".visualization").querySelector(".viz-zoom-out");
        if (event.resetSelection) {
            resetZoomButton.style.display = "none";
        } else {
            resetZoomButton.style.display = "grid";
        }

        return undefined;
    };

    private skipLeadingZeros(values: ISeriesDataItem[]) {
        const result = [...values];

        while (result[0]?.y === 0) {
            result.shift();
        }

        return result;
    }

    private createChartConfig(chartConfig: HighchartsOptions, legendItemsEnabled: any[]): HighchartsOptions {
        const { series, chart, xAxis, yAxis } = chartConfig;

        const selectionEvent = chart.zoomType
            ? {
                  selection: this.onChartSelection,
              }
            : {};

        const firstSeriesTypes = [
            VisualizationTypes.PIE,
            VisualizationTypes.DONUT,
            VisualizationTypes.TREEMAP,
            VisualizationTypes.FUNNEL,
            VisualizationTypes.PYRAMID,
        ];
        const multipleSeries = isOneOfTypes(chart.type, firstSeriesTypes);

        let items: any[] = isOneOfTypes(chart.type, firstSeriesTypes) ? (series?.[0] as any)?.data : series;

        if (isFunnel(chart.type)) {
            items = this.skipLeadingZeros(items).filter((i) => !isNil(i.y));
        }

        const updatedItems = items.map((item: any, itemIndex: number) => {
            const visible =
                legendItemsEnabled[itemIndex] !== undefined ? legendItemsEnabled[itemIndex] : true;
            return {
                ...item,
                visible: isNil(item.visible) ? visible : item.visible,
            };
        });

        let updatedSeries = updatedItems;
        if (multipleSeries) {
            updatedSeries = [
                {
                    ...series?.[0],
                    data: updatedItems,
                },
                ...series.slice(1),
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
    }

    public renderLegend(
        legendDetails: ILegendDetails,
        contentRect: ContentRect,
        containerId: string,
    ): React.ReactNode {
        const { chartOptions, legend, height, legendRenderer, locale } = this.props;
        const { items, format } = legend;
        const { showFluidLegend } = this.state;

        if (!legend.enabled) {
            return null;
        }

        let { type } = chartOptions;
        if (isPieOrDonutChart(type)) {
            type = VisualizationTypes.PIE;
        }
        const onItemClick =
            isSankeyOrDependencyWheel(type) || isWaterfall(type) ? noop : this.onLegendItemClick;

        const legendProps: ILegendProps = {
            responsive: legend.responsive,
            enableBorderRadius: legend.enableBorderRadius,
            seriesMapper: legend.seriesMapper,
            series: items,
            onItemClick,
            legendItemsEnabled: this.state.legendItemsEnabled,
            heatmapLegend: isHeatmap(type),
            height,
            legendLabel: legendDetails?.name,
            maximumRows: legendDetails?.maxRows,
            position: legendDetails.position,
            format,
            locale,
            showFluidLegend,
            validateOverHeight: noop,
            contentDimensions: contentRect?.client,
            containerId,
        };

        return legendRenderer(legendProps);
    }

    public renderHighcharts(): React.ReactNode {
        // shrink chart to give space to legend items
        const style = { flex: "1 1 auto", position: "relative", overflow: "hidden" };
        const config = this.createChartConfig(this.props.hcOptions, this.state.legendItemsEnabled);
        const chartProps = {
            domProps: { className: "viz-react-highchart-wrap gd-viz-highchart-wrap", style },
            ref: this.setChartRef,
            config,
            callback: this.props.afterRender,
        };
        return this.props.chartRenderer(chartProps);
    }

    private onZoomOutButtonClick = (): void => {
        this.chartRef.getChart().zoomOut();
    };

    private renderZoomOutButton() {
        const {
            hcOptions: { chart },
            theme,
            resetZoomButtonTooltip,
        } = this.props;
        if (chart?.zoomType) {
            return (
                <BubbleHoverTrigger
                    tagName="abbr"
                    hideDelay={100}
                    showDelay={100}
                    className="gd-bubble-trigger-zoom-out"
                >
                    <button
                        className="viz-zoom-out s-zoom-out"
                        onClick={this.onZoomOutButtonClick}
                        style={{ display: "none" }}
                    >
                        <Icon.Undo width={20} height={20} color={theme?.palette?.complementary?.c7} />
                    </button>
                    <Bubble alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}>
                        {resetZoomButtonTooltip}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        }
        return null;
    }

    private renderVisualization() {
        const { legend, chartOptions, contentRect } = this.props;
        const legendDetailOptions: ILegendDetailOptions = {
            showFluidLegend: this.state.showFluidLegend,
            contentRect,
            isHeatmap: isHeatmap(chartOptions.type),
            legendLabel: chartOptions.legendLabel,
        };
        const legendDetails = getLegendDetails(legend.position, legend.responsive, legendDetailOptions);
        if (!legendDetails) {
            return null;
        }

        const classes = cx(
            "viz-line-family-chart-wrap",
            "s-viz-line-family-chart-wrap",
            legend.responsive === true ? "responsive-legend" : "non-responsive-legend",
            {
                [`flex-direction-${this.getFlexDirection(legendDetails.position)}`]: true,
                "legend-position-bottom": legendDetails.position === BOTTOM,
            },
            this.containerId,
        );

        const legendPosition = legendDetails.position;
        const isLegendRenderedFirst: boolean =
            legendPosition === TOP || legendPosition === LEFT || this.state.showFluidLegend;

        return (
            <div className={classes} ref={this.highchartsRendererRef}>
                {this.renderZoomOutButton()}
                {isLegendRenderedFirst
                    ? this.renderLegend(legendDetails, contentRect, this.containerId)
                    : null}
                {this.renderHighcharts()}
                {!isLegendRenderedFirst
                    ? this.renderLegend(legendDetails, contentRect, this.containerId)
                    : null}
            </div>
        );
    }

    public render() {
        return this.renderVisualization();
    }

    private realignPieOrDonutChart() {
        const {
            chartOptions: { type, verticalAlign },
        } = this.props;
        const { chartRef } = this;

        if (isPieOrDonutChart(type) && chartRef) {
            alignChart(chartRef.getChart(), verticalAlign);
        }
    }
}
