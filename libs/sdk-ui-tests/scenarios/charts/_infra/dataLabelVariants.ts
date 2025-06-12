// (C) 2007-2019 GoodData Corporation

import { IChartConfig, IBucketChartProps } from "@gooddata/sdk-ui-charts";
import { CustomizedScenario, UnboundVisProps } from "../../../src/index.js";
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
