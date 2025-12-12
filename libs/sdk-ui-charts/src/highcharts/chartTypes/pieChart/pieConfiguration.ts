// (C) 2007-2025 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/index.js";
import { type HighchartsOptions, type SeriesPieOptions } from "../../lib/index.js";
import { alignChart } from "../_chartCreators/helpers.js";
import { getPieResponsiveConfig } from "../_chartCreators/responsive.js";
import { highlightChartPoints } from "../_chartHighlighting/highlightPoints.js";

export function getPieConfiguration(config: IChartConfig): HighchartsOptions {
    const pieConfiguration = {
        chart: {
            type: "pie",
            events: {
                load(this: Highcharts.Chart) {
                    const distance = -((this.series[0].points?.[0]?.shapeArgs?.["r"] ?? 30) / 3);
                    const options: SeriesPieOptions = {
                        type: "pie",
                        dataLabels: {
                            distance,
                        },
                    };
                    this.series[0].update(options);
                    alignChart(this, config.chart?.verticalAlign);

                    highlightChartPoints(this.series, config);
                },
            },
        },
        plotOptions: {
            pie: {
                size: "100%",
                allowPointSelect: false,
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true,
            },
        },
        legend: {
            enabled: false,
        },
    };

    if (config?.enableCompactSize) {
        return {
            ...pieConfiguration,
            responsive: getPieResponsiveConfig(),
        };
    }

    return pieConfiguration;
}
