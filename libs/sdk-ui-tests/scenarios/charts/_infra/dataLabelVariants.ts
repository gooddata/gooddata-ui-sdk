// (C) 2007-2019 GoodData Corporation

import { IChartConfig } from "@gooddata/sdk-ui";
import { CustomizedScenario, UnboundVisProps, VisProps } from "../../../src";
import { GermanNumberFormat } from "../../_infra/formatting";

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
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, dataLabelOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...dataLabelOverlay } },
        ];
    });
}
