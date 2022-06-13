// (C) 2007-2022 GoodData Corporation
export const DEFAULT_COLOR_PALETTE = [
    "rgb(20,178,226)",
    "rgb(0,193,141)",
    "rgb(229,77,66)",
    "rgb(241,134,0)",
    "rgb(171,85,163)",

    "rgb(244,213,33)",
    "rgb(148,161,174)",
    "rgb(107,191,216)",
    "rgb(181,136,177)",
    "rgb(238,135,128)",

    "rgb(241,171,84)",
    "rgb(133,209,188)",
    "rgb(41,117,170)",
    "rgb(4,140,103)",
    "rgb(181,60,51)",

    "rgb(163,101,46)",
    "rgb(140,57,132)",
    "rgb(136,219,244)",
    "rgb(189,234,222)",
    "rgb(239,197,194)",
].map(
    (color) =>
        `#${/rgb\((\d*),(\d*),(\d*)\)/
            .exec(color)!
            .slice(1)
            // eslint-disable-next-line sonarjs/no-nested-template-literals
            .map((val) => `0${parseInt(val, 10).toString(16)}`.slice(-2))
            .join("")}`,
);

export const CUSTOM_COLOR_PALETTE = [
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
