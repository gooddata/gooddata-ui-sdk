// (C) 2007-2019 GoodData Corporation

import { IChartConfig, IBucketChartProps } from "@gooddata/sdk-ui-charts";
import { CustomizedScenario, UnboundVisProps } from "../../../src/index.js";
import { GermanNumberFormat } from "../../_infra/formatting.js";

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default", {}],
    ["data labels auto visibility", { dataLabels: { visible: "auto" } }],
    ["data labels forced visible", { dataLabels: { visible: true } }],
    ["data labels forced hidden", { dataLabels: { visible: false } }],
    [
        "forced dataLabels visible and german separators",
        { dataLabels: { visible: true }, separators: GermanNumberFormat },
    ],
    [
        "data labels and totals with auto visibility",
        { dataLabels: { visible: "auto", totalsVisible: "auto" } },
    ],
    [
        "data labels forced hidden totals forced visible",
        { dataLabels: { visible: false, totalsVisible: true } },
    ],
    [
        "data labels forced hidden totals forced hidden",
        { dataLabels: { visible: false, totalsVisible: false } },
    ],
    [
        "labels forced hidden totals auto visibility",
        { dataLabels: { visible: false, totalsVisible: "auto" } },
    ],
];

export function extendedDataLabelCustomizer<T extends IBucketChartProps>(
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
