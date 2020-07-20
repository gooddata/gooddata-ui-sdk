// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";

const FUNNEL_TEMPLATE = {
    chart: {
        type: "funnel",
        spacingRight: 100,
    },
    plotOptions: {
        funnel: {
            dataLabels: {
                enabled: true,
                crop: false,
                overflow: "none",
                padding: 2,
            },
        },
    },
    legend: {
        enabled: false,
    },
};

export function getFunnelConfiguration() {
    return cloneDeep(FUNNEL_TEMPLATE);
}
