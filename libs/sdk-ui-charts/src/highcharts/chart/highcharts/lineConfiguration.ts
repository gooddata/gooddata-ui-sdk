// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

export const LINE_WIDTH = 3;

const LINE_TEMPLATE = {
    chart: {
        type: "line",
    },
    plotOptions: {
        series: {
            marker: {
                symbol: "circle",
                radius: 4.5,
            },
            lineWidth: LINE_WIDTH,
            fillOpacity: 0.3,
            states: {
                hover: {
                    lineWidth: LINE_WIDTH + 1,
                },
                inactive: {
                    opacity: 1,
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

export function getLineConfiguration(): typeof LINE_TEMPLATE {
    return cloneDeep(LINE_TEMPLATE);
}
