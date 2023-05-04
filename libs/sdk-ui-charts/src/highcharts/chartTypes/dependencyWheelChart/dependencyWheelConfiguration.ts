// (C) 2023 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { HighchartsOptions } from "../../lib";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive";

const DEPENDENCY_WHEEL_TEMPLATE = {
    chart: {
        type: "dependencywheel",
    },
    plotOptions: {
        dependencywheel: {
            showInLegend: true,
            dataLabels: {
                enabled: true,
                textPath: {
                    enabled: true,
                    attributes: {
                        dy: 3,
                    },
                },
                distance: 10,
            },
            nodeWidth: 10,
            size: "95%",
        },
    },
    legend: {
        enabled: false,
    },
};

export function getDependencyWheelConfiguration(): HighchartsOptions {
    const configuration = cloneDeep(DEPENDENCY_WHEEL_TEMPLATE);

    return {
        ...configuration,
        responsive: getCommonResponsiveConfig(),
    };
}
