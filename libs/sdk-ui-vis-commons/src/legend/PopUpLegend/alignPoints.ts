// (C) 2020-2021 GoodData Corporation
import { IAlignPoint } from "@gooddata/sdk-ui-kit";

export const legendDialogAlignPoints: IAlignPoint[] = [
    {
        align: "tr tl",
        offset: {
            x: 18,
            y: 0,
        },
    },
    {
        align: "tl tr",
        offset: {
            x: -18,
            y: 0,
        },
    },
    {
        align: "br bl",
        offset: {
            x: 18,
            y: 0,
        },
    },
    {
        align: "bl br",
        offset: {
            x: -18,
            y: 0,
        },
    },
    {
        align: "bc tc",
        offset: {
            x: 0,
            y: 18,
        },
    },
    {
        align: "cc cr",
        offset: {
            x: -200,
            y: 0,
        },
    },
];

export const legendMobileDialogAlignPoints: IAlignPoint[] = [
    {
        align: "bc tc",
        offset: {
            x: 0,
            y: -40,
        },
    },
    {
        align: "tc bc",
        offset: {
            x: 0,
            y: -18,
        },
    },
    {
        align: "cc tc",
        offset: {
            x: 0,
            y: 0,
        },
    },
];
