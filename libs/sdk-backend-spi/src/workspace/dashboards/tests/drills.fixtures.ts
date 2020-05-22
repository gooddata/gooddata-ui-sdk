// (C) 2019-2020 GoodData Corporation

import { IDrillToLegacyDashboard, IDrillToDashboard, IDrillToInsight } from "../drills";

export const drillToLegacyDashboard: IDrillToLegacyDashboard = {
    type: "drillToLegacyDashboard",
    origin: {
        measure: {
            uri: "/measure",
        },
        type: "drillFromMeasure",
    },
    target: {
        uri: "/targetUri",
    },
    tab: "tabId",
    transition: "in-place",
};

export const drillToDashboard: IDrillToDashboard = {
    type: "drillToDashboard",
    origin: {
        measure: {
            uri: "/measure",
        },
        type: "drillFromMeasure",
    },
    target: {
        uri: "/targetUri",
    },
    transition: "in-place",
};

export const drillToInsight: IDrillToInsight = {
    type: "drillToInsight",
    origin: {
        measure: {
            uri: "/measure",
        },
        type: "drillFromMeasure",
    },
    target: {
        uri: "/targetUri",
    },
    transition: "pop-up",
};
