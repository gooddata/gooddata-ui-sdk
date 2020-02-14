// (C) 2007-2018 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");

import { MAX_POINT_WIDTH } from "./commonConfiguration";

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

export function getColumnConfiguration() {
    return cloneDeep(COLUMN_TEMPLATE);
}
