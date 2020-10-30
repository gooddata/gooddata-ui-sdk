// (C) 2007-2018 GoodData Corporation
import React from "react";
import { Rect } from "react-measure";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import set from "lodash/set";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import partial from "lodash/partial";
import throttle from "lodash/throttle";
import isNil from "lodash/isNil";
import cx from "classnames";
import { IChartConfig, OnLegendReady } from "../../interfaces";
import { Chart, IChartProps } from "./Chart";
import { isPieOrDonutChart, isOneOfTypes, isHeatmap } from "../chartTypes/_util/common";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import Highcharts from "../lib";
import { alignChart } from "../chartTypes/_chartCreators/helpers";
import { ILegendProps, Legend, ILegendOptions } from "@gooddata/sdk-ui-vis-commons";
import { BOTTOM, LEFT, RIGHT, TOP } from "../typings/mess";

/**
 * @internal
 */
export const FLUID_LEGEND_THRESHOLD = 768;

export interface IChartHTMLElement extends HTMLElement {
    getChart(): Highcharts.Chart;
    getHighchartRef(): HTMLElement;
}

export interface IHighChartsRendererProps {
    chartOptions: any;
    hcOptions: any;
    documentObj?: Document;
    height: number;
    width: number;
    legend: ILegendOptions;
    locale: string;
    onLegendReady: OnLegendReady;
    legendRenderer(legendProps: ILegendProps): any;
    chartRenderer(chartProps: IChartProps): any;
    afterRender(): void;
}

export interface IHighChartsRendererState {
    legendItemsEnabled: boolean[];
    showFluidLegend: boolean;
}

export function renderChart(props: IChartProps): JSX.Element {
    return <Chart {...props} />;
}

export function renderLegend(props: ILegendProps): JSX.Element {
    return <Legend {...props} />;
}

function updateAxisTitleStyle(axis: Highcharts.AxisOptions) {
    set(axis, "title.style", {
        ...get(axis, "title.style", {}),
        textOverflow: "ellipsis",
        overflow: "hidden",
    });
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

    private highchartsRendererRef: any;
    private chartRef: IChartHTMLElement;
    private throttledOnWindowResize: any;

    constructor(props: IHighChartsRendererProps) {
        super(props);

        this.highchartsRendererRef = React.createRef<HTMLDivElement>();
        this.state = {
            legendItemsEnabled: [],
            showFluidLegend: this.shouldShowFluid(),
        };
        this.setChartRef = this.setChartRef.bind(this);
        this.onLegendItemClick = this.onLegendItemClick.bind(this);
        this.throttledOnWindowResize = throttle(this.onWindowResize.bind(this), 100);
    }

    public onWindowResize(): void {
        this.setState({
            showFluidLegend: this.shouldShowFluid(),
        });

        this.realignPieOrDonutChart();
    }

    public shouldShowFluid(): boolean {
        const { documentObj } = this.props;
        return documentObj.documentElement.clientWidth < FLUID_LEGEND_THRESHOLD;
    }

    public UNSAFE_componentWillMount(): void {
        this.resetLegendState(this.props);
    }

    public componentDidMount(): void {
        // http://stackoverflow.com/questions/18240254/highcharts-width-exceeds-container-div-on-first-load
        setTimeout(() => {
            if (this.chartRef) {
                const chart = this.chartRef.getChart();

                if (chart.container && chart.container.style) {
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
        const thisLegendItems = get(this.props, "legend.items", []);
        const nextLegendItems = get(nextProps, "legend.items", []);
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
    public onLegendItemClick(item: any): void {
        this.setState({
            legendItemsEnabled: set<boolean[]>(
                [...this.state.legendItemsEnabled],
                item.legendIndex,
                !this.state.legendItemsEnabled[item.legendIndex],
            ),
        });
    }

    public setChartRef(chartRef: IChartHTMLElement): void {
        this.chartRef = chartRef;
    }

    public getFlexDirection(): React.CSSProperties["flexDirection"] {
        const { legend } = this.props;

        if (legend.position === TOP || legend.position === BOTTOM) {
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
        const legendItemsCount = get(props, "legend.items.length", 0);
        this.setState({
            legendItemsEnabled: new Array(legendItemsCount).fill(true),
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private onChartSelection = (event: any): void => {
        const chartWrapper = event.target.renderTo.parentElement;
        const resetZoomButton = chartWrapper.closest(".gd-base-visualization").querySelector(".viz-zoom-out");
        if (event.resetSelection) {
            resetZoomButton.style.display = "none";
        } else {
            resetZoomButton.style.display = "block";
        }
    };

    public createChartConfig(chartConfig: IChartConfig, legendItemsEnabled: any[]): IChartConfig {
        const config: any = cloneDeep(chartConfig);
        const { yAxis } = config;

        yAxis.forEach((axis: Highcharts.AxisOptions) => updateAxisTitleStyle(axis));

        if (this.props.height) {
            // fixed chart height is used in Dashboard mobile view
            // with minHeight of the container (legend overlaps)
            config.chart.height = this.props.height;
        }
        if (chartConfig.chart.zoomType) {
            config.chart.events = {
                ...config.chart.events,
                selection: this.onChartSelection,
            };
        }
        // render chart with disabled visibility based on legendItemsEnabled
        const firstSeriesTypes = [
            VisualizationTypes.PIE,
            VisualizationTypes.DONUT,
            VisualizationTypes.TREEMAP,
        ];
        const itemsPath = isOneOfTypes(config.chart.type, firstSeriesTypes) ? "series[0].data" : "series";
        const items: any[] = get(config, itemsPath) as any[];
        set(
            config,
            itemsPath,
            items.map((item: any, itemIndex: any) => {
                const visible =
                    legendItemsEnabled[itemIndex] !== undefined ? legendItemsEnabled[itemIndex] : true;
                return {
                    ...item,
                    visible: isNil(item.visible) ? visible : item.visible,
                };
            }),
        );

        return config;
    }

    public renderLegend(): React.ReactNode {
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

        const legendProps: ILegendProps = {
            position: legend.position,
            responsive: legend.responsive,
            enableBorderRadius: legend.enableBorderRadius,
            seriesMapper: legend.seriesMapper,
            series: items,
            onItemClick: this.onLegendItemClick,
            legendItemsEnabled: this.state.legendItemsEnabled,
            heatmapLegend: isHeatmap(type),
            height,
            format,
            locale,
            showFluidLegend,
            validateOverHeight: this.validateOverHeight,
        };

        return legendRenderer(legendProps);
    }

    public renderHighcharts(): React.ReactNode {
        // shrink chart to give space to legend items
        const style = { flex: "1 1 auto", position: "relative" };
        const chartProps = {
            domProps: { className: "viz-react-highchart-wrap gd-viz-highchart-wrap", style },
            ref: this.setChartRef,
            config: this.createChartConfig(this.props.hcOptions, this.state.legendItemsEnabled),
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
        } = this.props;
        if (chart && chart.zoomType) {
            return (
                <button
                    className="viz-zoom-out s-zoom-out"
                    onClick={this.onZoomOutButtonClick}
                    style={{ display: "none" }}
                    title={chart.resetZoomButton?.tooltip}
                ></button>
            );
        }
        return null;
    }

    public render(): React.ReactNode {
        const { legend } = this.props;
        const { showFluidLegend } = this.state;

        const classes = cx(
            "viz-line-family-chart-wrap",
            "s-viz-line-family-chart-wrap",
            legend.responsive ? "responsive-legend" : "non-responsive-legend",
            {
                [`flex-direction-${this.getFlexDirection()}`]: true,
                "legend-position-bottom": this.isBottomLegend(legend),
            },
        );

        const isLegendRenderedFirst: boolean =
            legend.position === TOP || legend.position === LEFT || showFluidLegend;

        return (
            <div className={classes} ref={this.highchartsRendererRef}>
                {this.renderZoomOutButton()}
                {isLegendRenderedFirst && this.renderLegend()}
                {this.renderHighcharts()}
                {!isLegendRenderedFirst && this.renderLegend()}
            </div>
        );
    }

    private validateOverHeight = (legendRect: Rect) => {
        const { legend } = this.props;
        if (!this.isBottomLegend(legend)) {
            return;
        }

        const containerRect: ClientRect = this.highchartsRendererRef.current.getBoundingClientRect();
        const chartHeight: number = this.chartRef.getChart().chartHeight;
        const isLegendOverHeight: boolean = legendRect.height > containerRect.height - chartHeight;

        if (isLegendOverHeight) {
            const hcContainer = this.chartRef.getHighchartRef();
            set(hcContainer, "style", "flex: 1 0 auto; position: relative;");

            this.chartRef.getChart().update(
                {
                    chart: {
                        height: containerRect.height, // stretch chart fully
                    },
                },
                false,
                false,
                false,
            );
        }
    };

    private realignPieOrDonutChart() {
        const {
            chartOptions: { type },
        } = this.props;
        const { chartRef } = this;

        if (isPieOrDonutChart(type) && chartRef) {
            alignChart(chartRef.getChart());
        }
    }

    private isBottomLegend(legend: ILegendOptions): boolean {
        return legend.position === BOTTOM;
    }
}
