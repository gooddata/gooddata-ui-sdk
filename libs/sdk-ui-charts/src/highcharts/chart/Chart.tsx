// (C) 2007-2018 GoodData Corporation
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import React from "react";
import { initChartPlugins } from "./highcharts/chartPlugins";
import { IChartConfig } from "../../interfaces";
import Highcharts from "./highcharts/highchartsEntryPoint";

const HighchartsMore = require("highcharts/highcharts-more"); // tslint:disable-line
const drillmodule = require("highcharts/modules/drilldown"); // tslint:disable-line
const treemapModule = require("highcharts/modules/treemap"); // tslint:disable-line
const bulletModule = require("highcharts/modules/bullet"); // tslint:disable-line
const funnelModule = require("highcharts/modules/funnel"); // tslint:disable-line
const heatmap = require("highcharts/modules/heatmap"); // tslint:disable-line
const patternFill = require("highcharts/modules/pattern-fill"); // tslint:disable-line
const groupedCategories = require("highcharts-grouped-categories"); // tslint:disable-line

drillmodule(Highcharts);
treemapModule(Highcharts);
bulletModule(Highcharts);
funnelModule(Highcharts);
heatmap(Highcharts);
HighchartsMore(Highcharts);
patternFill(Highcharts);
groupedCategories(Highcharts);
initChartPlugins(Highcharts);

export interface IChartProps {
    config: IChartConfig;
    domProps: any;
    callback(): void;
}

export default class Chart extends React.Component<IChartProps> {
    public static defaultProps: Partial<IChartProps> = {
        callback: noop,
        domProps: {},
    };

    private chart: Highcharts.Chart;
    private chartRef: HTMLElement;

    public constructor(props: IChartProps) {
        super(props);
        this.setChartRef = this.setChartRef.bind(this);
    }

    public componentDidMount() {
        this.createChart(this.props.config);
    }

    public shouldComponentUpdate(nextProps: IChartProps) {
        if (isEqual(this.props.config, nextProps.config)) {
            return false;
        }

        return true;
    }

    public componentDidUpdate() {
        this.createChart(this.props.config);
    }

    public componentWillUnmount() {
        this.chart.destroy();
    }

    public getHighchartRef(): HTMLElement {
        return this.chartRef;
    }

    public setChartRef(ref: HTMLElement) {
        this.chartRef = ref;
    }

    public getChart(): Highcharts.Chart {
        if (!this.chart) {
            throw new Error("getChart() should not be called before the component is mounted");
        }

        return this.chart;
    }

    public createChart(config: IChartConfig) {
        const chartConfig = config.chart;
        this.chart = new Highcharts.Chart(
            {
                ...config,
                chart: {
                    ...chartConfig,
                    renderTo: this.chartRef,
                },
            },
            this.props.callback,
        );
    }

    public render() {
        return <div {...this.props.domProps} ref={this.setChartRef} />;
    }
}
