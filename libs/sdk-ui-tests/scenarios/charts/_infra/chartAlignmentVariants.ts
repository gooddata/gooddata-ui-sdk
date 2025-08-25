// (C) 2007-2025 GoodData Corporation
import { IBucketChartProps, IChartConfig } from "@gooddata/sdk-ui-charts";

import { CustomizedScenario, UnboundVisProps } from "../../../src/index.js";

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
