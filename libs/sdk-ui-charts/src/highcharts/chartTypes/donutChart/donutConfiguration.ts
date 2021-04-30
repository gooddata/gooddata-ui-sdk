// (C) 2007-2021 GoodData Corporation
import merge from "lodash/merge";
import { getPieConfiguration } from "../pieChart/pieConfiguration";
import { alignChart } from "../_chartCreators/helpers";
import { IChartConfig } from "../../../interfaces";
import { HighchartsOptions } from "../../../highcharts/lib";

export function getDonutConfiguration(config: IChartConfig): HighchartsOptions {
    return merge({}, getPieConfiguration(config), {
        chart: {
            events: {
                load() {
                    this.series[0].update({
                        dataLabels: {
                            distance: -((this.series[0].points?.[0]?.shapeArgs?.r ?? 40) * 0.25),
                        },
                    });

                    alignChart(this, config.chart?.verticalAlign);
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
