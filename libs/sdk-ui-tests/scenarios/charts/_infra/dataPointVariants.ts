// (C) 2007-2025 GoodData Corporation

import { type IBucketChartProps, type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type CustomizedScenario, type UnboundVisProps } from "../../../src/index.js";

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default", {}],
    ["auto visibility", { dataPoints: { visible: "auto" } }],
    ["forced visible", { dataPoints: { visible: true } }],
    ["forced hidden", { dataPoints: { visible: false } }],
];

export function dataPointCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, dataPointOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...dataPointOverlay } },
        ];
    });
}
