// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import isEqual = require("lodash/isEqual");
import noop = require("lodash/noop");
import partial = require("lodash/partial");
import throttle = require("lodash/throttle");
import isNil = require("lodash/isNil");
import * as cx from "classnames";
import Chart, { IChartProps } from "./Chart";
import Legend, { ILegendProps } from "./legend/Legend";
import { TOP, LEFT, BOTTOM, RIGHT } from "./legend/PositionTypes";
import { isPieOrDonutChart, isOneOfTypes } from "../utils/common";
import { VisualizationTypes } from "../../../constants/visualizationTypes";
import { OnLegendReady } from "../../../interfaces/Events";
import { IChartConfig } from "../../../interfaces/Config";

export const FLUID_LEGEND_THRESHOLD = 768;

export interface IChartHTMLElement extends HTMLElement {
    getChart(): Highcharts.Chart;
}

export interface IHighChartsRendererProps {
    chartOptions: any;
    hcOptions: any;
    documentObj?: Document;
    height: number;
    width: number;
    legend: any;
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

export function renderChart(props: IChartProps) {
    return <Chart {...props} />;
}

export function renderLegend(props: ILegendProps) {
    return <Legend {...props} />;
}

function updateAxisTitleStyle(axis: Highcharts.AxisOptions) {
    set(axis, "title.style", {
        ...get(axis, "title.style", {}),
        textOverflow: "ellipsis",
        overflow: "hidden",
    });
}

export default class HighChartsRenderer extends React.PureComponent<
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

    private chartRef: IChartHTMLElement;
    private throttledOnWindowResize: any;

    constructor(props: IHighChartsRendererProps) {
        super(props);
        this.state = {
            legendItemsEnabled: [],
            showFluidLegend: this.shouldShowFluid(),
        };
        this.setChartRef = this.setChartRef.bind(this);
        this.onLegendItemClick = this.onLegendItemClick.bind(this);
        this.throttledOnWindowResize = throttle(this.onWindowResize.bind(this), 100);
    }

    public onWindowResize() {
        this.setState({
            showFluidLegend: this.shouldShowFluid(),
        });
    }

    public shouldShowFluid() {
        const { documentObj } = this.props;
        return documentObj.documentElement.clientWidth < FLUID_LEGEND_THRESHOLD;
    }

    public componentWillMount() {
        this.resetLegendState(this.props);
    }

    public componentDidMount() {
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

    public componentWillUnmount() {
        this.throttledOnWindowResize.cancel();
        window.removeEventListener("resize", this.throttledOnWindowResize);
    }

    public componentWillReceiveProps(nextProps: IHighChartsRendererProps) {
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

    public onLegendItemClick(item: any) {
        this.setState({
            legendItemsEnabled: set<boolean[]>(
                [...this.state.legendItemsEnabled],
                item.legendIndex,
                !this.state.legendItemsEnabled[item.legendIndex],
            ),
        });
    }

    public setChartRef(chartRef: IChartHTMLElement) {
        this.chartRef = chartRef;
    }

    public getFlexDirection() {
        const { legend } = this.props;

        if (legend.position === TOP || legend.position === BOTTOM) {
            return "column";
        }

        return "row";
    }

    public getItems(items: any) {
        return items.map((i: any) => {
            return {
                name: i.name,
                color: i.color,
                onClick: partial(this.onLegendItemClick, i),
            };
        });
    }

    public resetLegendState(props: any) {
        const legendItemsCount = get(props, "legend.items.length", 0);
        this.setState({
            legendItemsEnabled: new Array(legendItemsCount).fill(true),
        });
    }

    public createChartConfig(chartConfig: IChartConfig, legendItemsEnabled: any): IChartConfig {
        const config: any = cloneDeep(chartConfig);
        const { yAxis } = config;

        yAxis.forEach((axis: Highcharts.AxisOptions) => updateAxisTitleStyle(axis));

        if (this.props.height) {
            // fixed chart height is used in Dashboard mobile view
            // with minHeight of the container (legend overlaps)
            config.chart.height = this.props.height;
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

    public renderLegend() {
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

        const legendProps = {
            position: legend.position,
            responsive: legend.responsive,
            chartType: type,
            series: items,
            onItemClick: this.onLegendItemClick,
            legendItemsEnabled: this.state.legendItemsEnabled,
            height,
            format,
            locale,
            showFluidLegend,
        };

        return legendRenderer(legendProps);
    }

    public renderHighcharts() {
        const style = { flex: "1 1 auto", position: "relative" };
        const chartProps = {
            domProps: { className: "viz-react-highchart-wrap gd-viz-highchart-wrap", style },
            ref: this.setChartRef,
            config: this.createChartConfig(this.props.hcOptions, this.state.legendItemsEnabled),
            callback: this.props.afterRender,
        };
        return this.props.chartRenderer(chartProps);
    }

    public render() {
        const { legend } = this.props;
        const { showFluidLegend } = this.state;

        const classes = cx(
            "viz-line-family-chart-wrap",
            legend.responsive ? "responsive-legend" : "non-responsive-legend",
            {
                [`flex-direction-${this.getFlexDirection()}`]: true,
            },
        );

        const renderLegendFirst = legend.position === TOP || (legend.position === LEFT && !showFluidLegend);

        return (
            <div className={classes}>
                {renderLegendFirst && this.renderLegend()}
                {this.renderHighcharts()}
                {!renderLegendFirst && this.renderLegend()}
            </div>
        );
    }
}
