// (C) 2007-2026 GoodData Corporation

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions, type SeriesPieOptions } from "../../lib/index.js";
import { alignChart, getResolvedPiePosition } from "../_chartCreators/helpers.js";
import { getPieResponsiveConfig } from "../_chartCreators/responsive.js";
import { highlightChartPoints } from "../_chartHighlighting/highlightPoints.js";

export function getPieConfiguration(config: IChartConfig): HighchartsOptions {
    const pieConfiguration = {
        chart: {
            type: "pie",
            events: {
                load(this: Highcharts.Chart) {
                    if (config?.enableDonutDataLabels) {
                        // Only inside placement needs runtime distance patching; outside sits at
                        // distance 30 from the static config. Backplate composes with whichever
                        // placement is active — no extra branch needed here.
                        if (getResolvedPiePosition(this) === "inside") {
                            const distance = -((this.series[0].points?.[0]?.shapeArgs?.["r"] ?? 30) / 3);
                            const options: SeriesPieOptions = {
                                type: "pie",
                                dataLabels: [{ distance, style: { textOutline: "none" } }],
                            };
                            this.series[0].update(options);
                        }
                    } else {
                        // Legacy behavior: unconditional distance patch (plain object).
                        const distance = -((this.series[0].points?.[0]?.shapeArgs?.["r"] ?? 30) / 3);
                        const options: SeriesPieOptions = {
                            type: "pie",
                            dataLabels: {
                                distance,
                            },
                        };
                        this.series[0].update(options);
                    }
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
