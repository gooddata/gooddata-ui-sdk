// (C) 2007-2025 GoodData Corporation

import { type IBucketChartProps, type IChartConfig } from "@gooddata/sdk-ui-charts";

import { type CustomizedScenario, type UnboundVisProps } from "../../../src/index.js";
import { GermanNumberFormat } from "../../_infra/formatting.js";

export const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default", {}],
    ["auto visibility", { dataLabels: { visible: "auto" } }],
    ["forced visible", { dataLabels: { visible: true } }],
    [
        "forced visible and german separators",
        { dataLabels: { visible: true }, separators: GermanNumberFormat },
    ],
    ["forced hidden", { dataLabels: { visible: false } }],
];

export function dataLabelCustomizer<T extends IBucketChartProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, dataLabelOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...dataLabelOverlay } },
        ];
    });
}
