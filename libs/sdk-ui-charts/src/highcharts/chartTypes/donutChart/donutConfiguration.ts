// (C) 2007-2025 GoodData Corporation

import { merge } from "lodash-es";

import { type IChartConfig } from "../../../interfaces/index.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { alignChart } from "../_chartCreators/helpers.js";
import { highlightChartPoints } from "../_chartHighlighting/highlightPoints.js";
import { getPieConfiguration } from "../pieChart/pieConfiguration.js";

export function getDonutConfiguration(config: IChartConfig): HighchartsOptions {
    return merge({}, getPieConfiguration(config), {
        chart: {
            events: {
                load(this: Highcharts.Chart) {
                    this.series[0].update({
                        dataLabels: {
                            distance: -((this.series[0].points?.[0]?.shapeArgs?.["r"] ?? 40) * 0.25),
                        },
                    } as any);

                    alignChart(this, config.chart?.verticalAlign);

                    highlightChartPoints(this.series, config);
                },
            },
        },
        plotOptions: {
            pie: {
                innerSize: "50%",
            },
        },
    });
}
