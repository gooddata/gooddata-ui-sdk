// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

const BUBBLE_TEMPLATE = {
    chart: {
        type: "bubble",
    },
    plotOptions: {
        bubble: {
            stickyTracking: false,
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
            dataLabels: {
                enabled: false, // TODO remove once FF for config panel is removed
                allowOverlap: false,
            },
        },
    },
    xAxis: [
        {
            startOnTick: true,
        },
    ],
    series: {
        states: {
            hover: {
                enabled: false,
            },
        },
    },
    legend: {
        enabled: false,
    },
};

export function getBubbleConfiguration() {
    return cloneDeep(BUBBLE_TEMPLATE);
}
