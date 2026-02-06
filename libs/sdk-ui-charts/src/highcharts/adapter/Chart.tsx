// (C) 2007-2026 GoodData Corporation

import { Component } from "react";

import { createCustomEqual } from "fast-equals";
import Highcharts from "highcharts/esm/highcharts.js";
import { v4 as uuid } from "uuid";

import {
    FOCUS_HIGHCHARTS_DATAPOINT_EVENT,
    type IFocusHighchartsDatapointEventDetail,
} from "@gooddata/sdk-ui";

import { initChartPlugins } from "./chartPlugins.js";
import { type HChart, type HighchartsOptions } from "../lib/index.js";

import "highcharts/esm/highcharts-more.js";
import "highcharts/esm/modules/drilldown.js";
import "highcharts/esm/modules/treemap.js";
import "highcharts/esm/modules/bullet.js";
import "highcharts/esm/modules/funnel.js";
import "highcharts/esm/modules/heatmap.js";
import "highcharts/esm/modules/pattern-fill.js";
import "highcharts/esm/modules/sankey.js";
import "highcharts/esm/modules/dependency-wheel.js";
import "highcharts/esm/modules/accessibility.js";

// NOTE: default initialization without accessible tooltip plugin.
// The conditional init with the flag is done in ChartTransformation.
initChartPlugins(Highcharts, false);

const isEqualIgnoreFunctions = createCustomEqual({
    createCustomConfig: () => ({ areFunctionsEqual: () => true }),
});

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
export class Chart extends Component<IChartProps> {
    public static defaultProps: Pick<IChartProps, "callback" | "domProps"> = {
        callback: () => {},
        domProps: {},
    };

    private chart!: HChart;
    private chartRef!: HTMLElement;

    private id = `gd-highcharts-chart-${uuid()}`;

    private focusDatapoint = (event: CustomEventInit<IFocusHighchartsDatapointEventDetail>): void => {
        const { chartId, seriesIndex, pointIndex } = event.detail!;

        if (chartId !== this.id) {
            return;
        }

        const point = this.chart.series[seriesIndex]?.points[pointIndex];

        if (!point) {
            console.error(`Point not found: seriesIndex=${seriesIndex}, pointIndex=${pointIndex}`);
        }

        point.highlight();
    };

    public override componentDidMount(): void {
        this.createChart(this.props.config);

        // hacky fix for sankey chart https://github.com/highcharts/highcharts/issues/9818,
        // should've been resolved in 12.2.0, but it's not https://github.com/highcharts/highcharts/commit/240c21fa7153a26dbed91d3f27a35fe1301b9647
        const isSankey = this.props?.config?.chart?.type === "sankey";
        if (this.chart && isSankey) {
            const currentWidth = this.chart.chartWidth;
            this.chart.setSize(currentWidth - 1, undefined, false);
            this.chart.setSize(currentWidth, undefined, false);
        }

        window.addEventListener(FOCUS_HIGHCHARTS_DATAPOINT_EVENT, this.focusDatapoint);
    }

    public override shouldComponentUpdate(nextProps: IChartProps): boolean {
        // Warning: the config appears never to be equal as the functions it contains change their references.
        // This results in the chart being recreated on every render.
        // This is why we use a custom equality function that ignores the functions.
        return !isEqualIgnoreFunctions(this.props.config, nextProps.config);
    }

    public override componentDidUpdate(): void {
        this.createChart(this.props.config);
    }

    public override componentWillUnmount(): void {
        window.removeEventListener(FOCUS_HIGHCHARTS_DATAPOINT_EVENT, this.focusDatapoint);

        try {
            this.chart.destroy();
        } catch (error) {
            console.error("Chart could not be destroyed.", error);
        }
    }

    public getHighchartRef(): HTMLElement {
        return this.chartRef;
    }

    public setChartRef = (ref: HTMLElement): void => {
        this.chartRef = ref;
    };

    public getChart(): HChart {
        if (!this.chart) {
            throw new Error("getChart() should not be called before the component is mounted");
        }

        return this.chart;
    }

    public createChart(config: HighchartsOptions): void {
        const chartConfig = (config as any).chart;

        try {
            this.chart = new Highcharts.Chart(
                {
                    ...config,
                    chart: {
                        ...chartConfig,
                        id: this.id,
                        renderTo: this.chartRef,
                    },
                },
                this.props.callback,
            );
            this.chart.id = this.id;
        } catch (error) {
            console.error("Chart could not be rendered with the current config.", error);
        }
    }

    public override render() {
        return <div id={this.id} {...this.props.domProps} ref={this.setChartRef} />;
    }
}
