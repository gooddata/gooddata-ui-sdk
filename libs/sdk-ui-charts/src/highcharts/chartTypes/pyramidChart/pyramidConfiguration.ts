// (C) 2007-2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";

const WIDTH_SPAN = 900;
const WIDTH = 0.7;

const widthPercent = `${WIDTH * 100}%`;

const PYRAMID_TEMPLATE = {
    chart: {
        type: "pyramid",
        spacingRight: 0,
    },
    plotOptions: {
        pyramid: {
            dataLabels: {
                enabled: true,
                crop: false,
                overflow: "none",
                padding: 2,
            },
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
                        pyramid: {
                            width: WIDTH_SPAN * WIDTH, // we have plotOptions.pyramid.width so multiply the desired width to match
                        },
                    },
                },
            },
        ],
    },
};

export function getPyramidConfiguration(): typeof PYRAMID_TEMPLATE {
    return cloneDeep(PYRAMID_TEMPLATE);
}
