// (C) 2007-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";

const WIDTH_SPAN = 900;
const WIDTH = 0.8;
const NECK_WIDTH = 0.3;

const widthPercent = `${WIDTH * 100}%`;
const neckWidthPercent = `${NECK_WIDTH * 100}%`;

const FUNNEL_TEMPLATE = {
    chart: {
        type: "funnel",
        spacingRight: 0,
    },
    plotOptions: {
        funnel: {
            dataLabels: {
                enabled: true,
                crop: false,
                overflow: "none",
                padding: 2,
            },
            center: ["50%", "50%"],
            neckWidth: neckWidthPercent,
            neckHeight: "0%",
            width: widthPercent,
        },
    },
    legend: {
        enabled: false,
    },
    responsive: {
        rules: [
            {
                // the purpose of this rule is to make sure that above WIDTH_SPAN, the chart  width is fixed
                // and keeps the proportions which are identical to the state at WIDTH_SPAN width
                condition: {
                    minWidth: WIDTH_SPAN,
                },
                chartOptions: {
                    plotOptions: {
                        funnel: {
                            center: ["50%", "50%"],
                            neckWidth: WIDTH_SPAN * WIDTH * NECK_WIDTH, // percentage of the width (below)
                            neckHeight: "0%",
                            width: WIDTH_SPAN * WIDTH, // we have plotOptions.funnel.width so multiply the desired width to match
                        },
                    },
                },
            },
        ],
    },
};

export function getFunnelConfiguration(): typeof FUNNEL_TEMPLATE {
    return cloneDeep(FUNNEL_TEMPLATE);
}
