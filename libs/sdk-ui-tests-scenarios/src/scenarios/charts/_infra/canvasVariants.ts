// (C) 2024-2026 GoodData Corporation

import { type IBucketChartProps, type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type UnboundVisProps } from "../../../scenario.js";
import { type CustomizedScenario } from "../../../scenarioGroup.js";

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
