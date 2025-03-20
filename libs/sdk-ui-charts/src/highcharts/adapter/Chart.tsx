// (C) 2007-2025 GoodData Corporation
/* eslint-disable import/no-unassigned-import */

import isEqual from "lodash/isEqual.js";
import noop from "lodash/noop.js";
import React from "react";
import { initChartPlugins } from "./chartPlugins.js";
import Highcharts, { HighchartsOptions } from "../lib/index.js";

import "highcharts/highcharts-more.js";
import "highcharts/modules/drilldown.js";
import "highcharts/modules/treemap.js";
import "highcharts/modules/bullet.js";
import "highcharts/modules/funnel.js";
import "highcharts/modules/heatmap.js";
import "highcharts/modules/pattern-fill.js";
import "highcharts/modules/sankey.js";
import "highcharts/modules/dependency-wheel.js";
import "highcharts/modules/accessibility.js";

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

        try {
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
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Chart could not be rendered with the current config.", error);
        }
    }

    public render() {
        return <div {...this.props.domProps} ref={this.setChartRef} />;
    }
}
