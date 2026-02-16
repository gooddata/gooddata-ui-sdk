// (C) 2007-2026 GoodData Corporation

import { type IBucketChartProps, type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type UnboundVisProps } from "../../../scenario.js";
import { type CustomizedScenario } from "../../../scenarioGroup.js";

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["bottom", { chart: { verticalAlign: "bottom" } }],
    ["middle", { chart: { verticalAlign: "middle" } }],
    ["top", { chart: { verticalAlign: "top" } }],
    ["default", {}],
];

export function chartAlignmentVariants<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, config]) => {
        return [`${baseName} - ${variantName}`, { ...baseProps, config }];
    });
}
