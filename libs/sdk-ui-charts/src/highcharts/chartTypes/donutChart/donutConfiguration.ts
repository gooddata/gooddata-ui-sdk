// (C) 2007-2020 GoodData Corporation
import merge from "lodash/merge";
import get from "lodash/get";
import { getPieConfiguration } from "../pieChart/pieConfiguration";
import { alignChart } from "../_integration/helpers";

export function getDonutConfiguration(): ReturnType<typeof getPieConfiguration> {
    return merge({}, getPieConfiguration(), {
        chart: {
            events: {
                load() {
                    this.series[0].update({
                        dataLabels: {
                            distance: -(get(this, "series.0.points.0.shapeArgs.r", 40) * 0.25),
                        },
                    });

                    alignChart(this);
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
