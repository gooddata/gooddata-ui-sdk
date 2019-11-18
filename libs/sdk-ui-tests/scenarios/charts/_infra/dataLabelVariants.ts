// (C) 2007-2019 GoodData Corporation

import { IChartConfig } from "@gooddata/sdk-ui";
import { ScenarioNameAndProps, UnboundVisProps, VisProps } from "../../../src";

export const GermanNumberFormat = {
    thousand: ".",
    decimal: ",",
};

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default", {}],
    ["auto visibility", { dataLabels: { visible: "auto" } }],
    ["forced visible", { dataLabels: { visible: true } }],
    [
        "forced visible and german separators",
        { dataLabels: { visible: true }, separators: GermanNumberFormat },
    ],
    ["forced hidden", { dataLabels: { visible: false } }],
];

export function dataLabelCustomizer<T extends VisProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<ScenarioNameAndProps<T>> {
    return ConfigVariants.map(([variantName, dataLabelOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...dataLabelOverlay } },
        ];
    });
}
