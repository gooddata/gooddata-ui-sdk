// (C) 2007-2018 GoodData Corporation
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import React from "react";
import { initChartPlugins } from "./chartTypes/_integration/chartPlugins";
import { IChartConfig } from "../interfaces";
import Highcharts from "./chartTypes/_integration/highchartsEntryPoint";

import HighchartsMore from "highcharts/highcharts-more";
import drillmodule from "highcharts/modules/drilldown";
import treemapModule from "highcharts/modules/treemap";
import bulletModule from "highcharts/modules/bullet";
import funnelModule from "highcharts/modules/funnel";
import heatmap from "highcharts/modules/heatmap";
import patternFill from "highcharts/modules/pattern-fill";
import groupedCategories from "highcharts-grouped-categories";

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

export class Chart extends React.Component<IChartProps> {
    public static defaultProps: Partial<IChartProps> = {
        callback: noop,
        domProps: {},
    };

    private chart: Highcharts.Chart;
    private chartRef: HTMLElement;

    public componentDidMount(): void {
        this.createChart(this.props.config);
    }

    public shouldComponentUpdate(nextProps: IChartProps): boolean {
        if (isEqual(this.props.config, nextProps.config)) {
            return false;
        }

        return true;
    }

    public componentDidUpdate(): void {
        this.createChart(this.props.config);
    }

    public componentWillUnmount(): void {
        this.chart.destroy();
    }

    public getHighchartRef(): HTMLElement {
        return this.chartRef;
    }

    public setChartRef = (ref: HTMLElement): void => {
        this.chartRef = ref;
    };

    public getChart(): Highcharts.Chart {
        if (!this.chart) {
            throw new Error("getChart() should not be called before the component is mounted");
        }

        return this.chart;
    }

    public createChart(config: IChartConfig): void {
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

    public render(): React.ReactNode {
        return <div {...this.props.domProps} ref={this.setChartRef} />;
    }
}
