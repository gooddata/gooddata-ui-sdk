// (C) 2007-2019 GoodData Corporation
import { IColor, IColorPalette } from "@gooddata/sdk-model";

export const BlackColor: IColor = {
    type: "rgb",
    value: {
        r: 0,
        g: 0,
        b: 0,
    },
};

export const RedColor: IColor = {
    type: "rgb",
    value: {
        r: 255,
        g: 0,
        b: 0,
    },
};

export const CustomColors: string[] = [
    "rgb(33, 41, 195)",
    "rgb(18, 194, 25)",
    "rgb(243, 56, 47)",
    "rgb(240, 239, 8)",
    "rgb(131, 131, 131)",
];

export const CustomColorPalette: IColorPalette = [
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

export const CustomPaletteColor: IColor = {
    type: "guid",
    value: "05",
};
