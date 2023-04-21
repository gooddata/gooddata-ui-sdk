// (C) 2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive";
import { HighchartsOptions } from "../../lib";

const SANKEY_TEMPLATE = {
    chart: {
        type: "sankey",
    },
    plotOptions: {
        sankey: {
            showInLegend: true,
            dataLabels: {
                enabled: true,
                padding: 12,
                align: "left",
            },
            nodeWidth: 5,
        },
    },
    legend: {
        enabled: false,
    },
};

export function getSankeyConfiguration(): HighchartsOptions {
    const configuration = cloneDeep(SANKEY_TEMPLATE);

    return {
        ...configuration,
        responsive: getCommonResponsiveConfig(),
    };
}
