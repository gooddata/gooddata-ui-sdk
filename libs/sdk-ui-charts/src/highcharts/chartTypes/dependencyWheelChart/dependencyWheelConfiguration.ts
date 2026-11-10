// (C) 2023-2026 GoodData Corporation

import { _cloneDeep } from "@gooddata/util";

import { type HighchartsOptions } from "../../lib/index.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";

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
            linkOpacity: 0.35,
            states: {
                inactive: {
                    opacity: 0.2,
                    linkOpacity: 0.1,
                },
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
    const configuration = _cloneDeep(DEPENDENCY_WHEEL_TEMPLATE);

    return {
        ...configuration,
        responsive: getCommonResponsiveConfig(),
    };
}
