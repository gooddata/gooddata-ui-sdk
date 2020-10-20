// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

const LINE_WIDTH = 3;

const AREA_TEMPLATE = {
    chart: {
        type: "area",
    },
    plotOptions: {
        area: {
            lineWidth: 1,
        },
        series: {
            marker: {
                symbol: "circle",
                radius: 4.5,
            },
            lineWidth: LINE_WIDTH,
            fillOpacity: 0.6,
            states: {
                hover: {
                    lineWidth: LINE_WIDTH + 1,
                },
            },
        },
        column: {
            dataLabels: {},
        },
    },
    xAxis: [
        {
            categories: [],
        },
    ],
    yAxis: [
        {
            stackLabels: {
                enabled: false,
            },
        },
    ],
} as const;

export function getAreaConfiguration(): typeof AREA_TEMPLATE {
    return cloneDeep(AREA_TEMPLATE);
}
