// (C) 2007-2022 GoodData Corporation
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import React from "react";
import { initChartPlugins } from "./chartPlugins";
import Highcharts, { HighchartsOptions } from "../lib";

import HighchartsMore from "highcharts/highcharts-more";
import drillmodule from "highcharts/modules/drilldown";
import treemapModule from "highcharts/modules/treemap";
import bulletModule from "highcharts/modules/bullet";
import funnelModule from "highcharts/modules/funnel";
import heatmap from "highcharts/modules/heatmap";
import patternFill from "highcharts/modules/pattern-fill";

drillmodule(Highcharts);
treemapModule(Highcharts);
bulletModule(Highcharts);
funnelModule(Highcharts);
heatmap(Highcharts);
HighchartsMore(Highcharts);
patternFill(Highcharts);
initChartPlugins(Highcharts);

/**
 * @internal
 */
export interface IChartProps {
    config: HighchartsOptions;
    domProps: any;
    callback(): void;
}

/**
 * @internal
 */
export class Chart extends React.Component<IChartProps> {
    public static defaultProps: Pick<IChartProps, "callback" | "domProps"> = {
        callback: noop,
        domProps: {},
    };

    private chart: Highcharts.Chart;
    private chartRef: HTMLElement;

    public componentDidMount(): void {
        this.createChart(this.props.config);
    }

    public shouldComponentUpdate(nextProps: IChartProps): boolean {
        return !isEqual(this.props.config, nextProps.config);
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

    public createChart(config: HighchartsOptions): void {
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
