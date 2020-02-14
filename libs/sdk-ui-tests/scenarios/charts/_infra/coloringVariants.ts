// (C) 2007-2019 GoodData Corporation

import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { CustomizedScenario, ScenarioTag, UnboundVisProps, VisProps } from "../../../src";
import { CustomColorPalette, CustomColors } from "../../_infra/colors";

const ConfigVariants: Array<[string, IChartConfig, ScenarioTag[]?]> = [
    ["default", {}, ["mock-no-insight"]],
    ["custom palette", { colorPalette: CustomColorPalette }],
    ["custom colors", { colors: CustomColors }, ["mock-no-insight"]],
    [
        "custom palette preferred over colors",
        {
            colorPalette: CustomColorPalette,
            colors: CustomColors,
        },
        ["mock-no-insight"],
    ],
];

export function coloringCustomizer<T extends VisProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
    baseTags: ScenarioTag[],
): Array<CustomizedScenario<T>> {
    return ConfigVariants.map(([variantName, coloringOverlay, tags = []]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...coloringOverlay } },
            [...baseTags, ...tags],
        ];
    });
}
