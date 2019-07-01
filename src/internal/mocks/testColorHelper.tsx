// (C) 2019 GoodData Corporation
import * as ChartConfiguration from "../../interfaces/Config";
import cloneDeep = require("lodash/cloneDeep");

export function getLargePalette() {
    const largePalette = cloneDeep(ChartConfiguration.DEFAULT_COLOR_PALETTE);

    for (let i = 0; i < ChartConfiguration.DEFAULT_COLOR_PALETTE.length; i++) {
        const itemClon = cloneDeep(ChartConfiguration.DEFAULT_COLOR_PALETTE[i]);
        itemClon.guid = i + "_" + itemClon.guid;
        largePalette.push(itemClon);
    }

    return largePalette;
}

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
