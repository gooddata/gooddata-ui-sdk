// (C) 2007-2019 GoodData Corporation

import { IChartConfig } from "@gooddata/sdk-ui";
import { ScenarioNameAndProps, UnboundVisProps, VisProps } from "../../../src";
import { CustomColorPalette, CustomColors } from "./colors";

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default", {}],
    ["custom palette", { colorPalette: CustomColorPalette }],
    ["custom colors", { colors: CustomColors }],
    [
        "custom palette preferred over colors",
        {
            colorPalette: CustomColorPalette,
            colors: CustomColors,
        },
    ],
];

export function coloringCustomizer<T extends VisProps>(
    baseName: string,
    baseProps: UnboundVisProps<T>,
): Array<ScenarioNameAndProps<T>> {
    return ConfigVariants.map(([variantName, coloringOverlay]) => {
        return [
            `${baseName} - ${variantName}`,
            { ...baseProps, config: { ...baseProps.config, ...coloringOverlay } },
        ];
    });
}
