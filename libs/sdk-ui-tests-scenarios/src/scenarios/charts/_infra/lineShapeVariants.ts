// (C) 2007-2026 GoodData Corporation

import { type IBucketChartProps, type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type UnboundVisProps } from "../../../scenario.js";
import { type CustomizedScenario } from "../../../scenarioGroup.js";

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default", {}], // If nothing is set, check that it correctly defaults to `{ lineShape: "linear" }`
    ["linear", { lineShape: "linear" }],
    ["spline", { lineShape: "spline" }],
    ["stepped", { lineShape: "stepped" }],
];

export function lineShapeCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, lineShapeConfig]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...lineShapeConfig } },
        ];
    });
}

export function lineShapeCustomizerNoDefault<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.filter(([variant]) => variant !== "default").map(
        ([variantName, lineShapeConfig]) => {
            return [
                `${baseName} - ${variantName}`,
                { ...baseProps, config: { ...baseProps.config, ...lineShapeConfig } },
            ];
        },
    );
}
