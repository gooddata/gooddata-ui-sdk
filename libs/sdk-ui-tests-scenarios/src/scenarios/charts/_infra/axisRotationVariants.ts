// (C) 2007-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";

import { type IBucketChartProps, type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type UnboundVisProps } from "../../../scenario.js";
import { type CustomizedScenario } from "../../../scenarioGroup.js";

const ConfigVariants: Array<[string]> = [["90"], ["-90"], ["60"], ["-60"]];

function updateAxisSettings(rotation: string, config: IChartConfig = {}): IChartConfig {
    const copy = cloneDeep(config);

    if (copy.xaxis) {
        copy.xaxis.rotation = rotation;
    }

    if (copy.secondary_xaxis) {
        copy.secondary_xaxis.rotation = rotation;
    }

    return copy;
}

export function axisRotationVariants<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([rotation]) => {
        /*
         * stories use the scenario name as story name. the minus sign messes things up and would lead
         * to duplicate stories..
         */
        return [
            `${baseName} - ${rotation.replace("-", "minus")}`,
            { ...baseProps, config: updateAxisSettings(rotation, baseProps.config) },
        ];
    });
}
