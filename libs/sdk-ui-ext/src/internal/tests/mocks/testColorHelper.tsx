// (C) 2019-2022 GoodData Corporation
import { DefaultColorPalette } from "@gooddata/sdk-ui";
import cloneDeep from "lodash/cloneDeep.js";
import { IColorPalette } from "@gooddata/sdk-model";

export function getLargePalette(): IColorPalette {
    const largePalette = cloneDeep(DefaultColorPalette);

    for (let i = 0; i < DefaultColorPalette.length; i++) {
        const itemClon = cloneDeep(DefaultColorPalette[i]);
        itemClon.guid = i + "_" + itemClon.guid;
        itemClon.fill.r = itemClon.fill.r + 1;
        largePalette.push(itemClon);
    }

    return largePalette;
}

export const colorPaletteWithOneColor = [
    {
        guid: "01",
        fill: {
            r: 195,
            g: 49,
            b: 73,
        },
    },
];

export const colorPalette = [
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
