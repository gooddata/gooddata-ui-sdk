// (C) 2007-2023 GoodData Corporation
import isEqual from "lodash/isEqual.js";
import noop from "lodash/noop.js";
import React from "react";
import { initChartPlugins } from "./chartPlugins.js";
import Highcharts, { HighchartsOptions } from "../lib/index.js";
import { defaultImport } from "default-import";

import defaultHighchartsMore from "highcharts/highcharts-more.js";
import defaultDrillmodule from "highcharts/modules/drilldown.js";
import defaultTreemapModule from "highcharts/modules/treemap.js";
import defaultBulletModule from "highcharts/modules/bullet.js";
import defaultFunnelModule from "highcharts/modules/funnel.js";
import defaultHeatmap from "highcharts/modules/heatmap.js";
import defaultPatternFill from "highcharts/modules/pattern-fill.js";
import defaultSankeyModule from "highcharts/modules/sankey.js";
import defaultDependencyWheelModule from "highcharts/modules/dependency-wheel.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
export const drillmodule = defaultImport(defaultDrillmodule);
export const treemapModule = defaultImport(defaultTreemapModule);
export const bulletModule = defaultImport(defaultBulletModule);
export const funnelModule = defaultImport(defaultFunnelModule);
export const sankeyModule = defaultImport(defaultSankeyModule);
export const dependencyWheelModule = defaultImport(defaultDependencyWheelModule);
export const heatmap = defaultImport(defaultHeatmap);
export const HighchartsMore = defaultImport(defaultHighchartsMore);
export const patternFill = defaultImport(defaultPatternFill);

drillmodule(Highcharts);
treemapModule(Highcharts);
bulletModule(Highcharts);
funnelModule(Highcharts);
sankeyModule(Highcharts);
dependencyWheelModule(Highcharts);
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
