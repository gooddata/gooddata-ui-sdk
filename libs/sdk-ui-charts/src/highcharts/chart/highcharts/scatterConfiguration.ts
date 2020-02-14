// (C) 2007-2018 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");

export const LINE_WIDTH = 3;

const SCATTER_TEMPLATE: any = {
    chart: {
        type: "scatter",
    },
    plotOptions: {
        scatter: {
            marker: {
                symbol: "circle",
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: "white",
                    },
                },
            },
            states: {
                hover: {
                    marker: {
                        enabled: false,
                    },
                },
            },
        },
    },
    xAxis: [
        {
            startOnTick: true,
        },
    ],
    series: {
        lineWidth: LINE_WIDTH,
        fillOpacity: 0.3,
        states: {
            hover: {
                lineWidth: LINE_WIDTH + 1,
            },
        },
    },
    legend: {
        enabled: false,
    },
};

export function getScatterConfiguration() {
    return cloneDeep(SCATTER_TEMPLATE);
}
