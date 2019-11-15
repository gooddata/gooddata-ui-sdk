// (C) 2007-2019 GoodData Corporation

import { IColorPalette } from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui";
import { ScenarioNameAndProps, UnboundVisProps, VisProps } from "../../../src";

const CUSTOM_COLORS: string[] = [
    "rgb(33, 41, 195)",
    "rgb(18, 194, 25)",
    "rgb(243, 56, 47)",
    "rgb(240, 239, 8)",
    "rgb(131, 131, 131)",
];

const CUSTOM_COLOR_PALETTE: IColorPalette = [
    {
        guid: "01",
        fill: {
            r: 195,
            g: 49,
            b: 73,
        },
    },
    {
        guid: "02",
        fill: {
            r: 168,
            g: 194,
            b: 86,
        },
    },
    {
        guid: "03",
        fill: {
            r: 243,
            g: 217,
            b: 177,
        },
    },
    {
        guid: "04",
        fill: {
            r: 194,
            g: 153,
            b: 121,
        },
    },
    {
        guid: "05",
        fill: {
            r: 162,
            g: 37,
            b: 34,
        },
    },
];

const ConfigVariants: Array<[string, IChartConfig]> = [
    ["default", {}],
    ["custom palette", { colorPalette: CUSTOM_COLOR_PALETTE }],
    ["custom colors", { colors: CUSTOM_COLORS }],
    [
        "custom palette preferred over colors",
        {
            colorPalette: CUSTOM_COLOR_PALETTE,
            colors: CUSTOM_COLORS,
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
