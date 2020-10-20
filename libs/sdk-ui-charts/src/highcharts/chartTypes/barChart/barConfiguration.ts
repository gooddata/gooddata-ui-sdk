// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration";

const BAR_TEMPLATE = {
    chart: {
        type: "bar",
    },
    plotOptions: {
        bar: {
            maxPointWidth: MAX_POINT_WIDTH,
            dataLabels: {
                enabled: true,
                padding: 2,
            },
        },
        series: {
            states: {
                hover: {
                    enabled: false,
                },
            },
        },
    },
    yAxis: [
        {
            stackLabels: {
                enabled: false,
            },
        },
    ],
};

export function getBarConfiguration(): typeof BAR_TEMPLATE {
    return cloneDeep(BAR_TEMPLATE);
}
