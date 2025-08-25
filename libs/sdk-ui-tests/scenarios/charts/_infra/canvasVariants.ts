// (C) 2024-2025 GoodData Corporation

import { IBucketChartProps, IChartConfig } from "@gooddata/sdk-ui-charts";

import { CustomizedScenario, UnboundVisProps } from "../../../src/index.js";

export const ConfigVariants: Array<[string, IChartConfig]> = [["large row height", { rowHeight: "large" }]];

export function canvasCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, canvasOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...canvasOverlay } },
        ];
    });
}
