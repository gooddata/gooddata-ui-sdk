// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

import { MAX_POINT_WIDTH } from "../_integration/commonConfiguration";

const COLUMN_TEMPLATE = {
    chart: {
        type: "column",
        spacingTop: 20,
    },
    plotOptions: {
        column: {
            dataLabels: {
                enabled: true,
                padding: 2,
            },
            maxPointWidth: MAX_POINT_WIDTH,
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
                enabled: true,
                allowOverlap: false,
            },
        },
    ],
};

export function getColumnConfiguration(): typeof COLUMN_TEMPLATE {
    return cloneDeep(COLUMN_TEMPLATE);
}
