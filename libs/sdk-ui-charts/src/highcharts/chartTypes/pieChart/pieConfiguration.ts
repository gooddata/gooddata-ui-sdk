// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import { alignChart } from "../_integration/helpers";

const PIE_TEMPLATE = {
    chart: {
        type: "pie",
        events: {
            load() {
                this.series[0].update({
                    dataLabels: {
                        distance: -(get(this, "series.0.points.0.shapeArgs.r", 30) / 3),
                    },
                });

                alignChart(this);
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

export function getPieConfiguration(): typeof PIE_TEMPLATE {
    return cloneDeep(PIE_TEMPLATE);
}
