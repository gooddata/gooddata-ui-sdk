// (C) 2020-2022 GoodData Corporation
import { IAlignPoint } from "@gooddata/sdk-ui-kit";

export const kpiAlertDialogAlignPoints: IAlignPoint[] = [
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
        align: "bc tc",
        offset: {
            x: 0,
            y: 18,
        },
    },
    {
        align: "tc cr",
        offset: {
            x: -100,
            y: 90,
        },
    },
    {
        align: "tc cl",
        offset: {
            x: 100,
            y: 90,
        },
    },
    {
        align: "tc cr",
        offset: {
            x: -50,
            y: 90,
        },
    },
    {
        align: "tc cl",
        offset: {
            x: 50,
            y: 90,
        },
    },
];

export const kpiAlertDialogMobileAlignPoints: IAlignPoint[] = [
    {
        align: "bc tc",
        offset: {
            x: 0,
            y: 18,
        },
    },
    {
        align: "bl tl",
        offset: {
            x: 0,
            y: 18,
        },
    },
    {
        align: "br tr",
        offset: {
            x: 0,
            y: 18,
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
        align: "tl bl",
        offset: {
            x: 0,
            y: -18,
        },
    },
    {
        align: "tr br",
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
    {
        align: "cl tl",
        offset: {
            x: 0,
            y: 0,
        },
    },
    {
        align: "cr tr",
        offset: {
            x: 0,
            y: 0,
        },
    },
];
