// (C) 2019-2021 GoodData Corporation
import { localIdRef } from "../../objRef/factory.js";
import {
    IDrillToLegacyDashboard,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillFromMeasure,
    IDrillFromAttribute,
} from "../drill.js";

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

export const drillFromMeasure: IDrillFromMeasure = {
    type: "drillFromMeasure",
    measure: localIdRef("measureLocalIdentifier"),
};

export const drillFromAttribute: IDrillFromAttribute = {
    type: "drillFromAttribute",
    attribute: localIdRef("attributeLocalIdentifier"),
};
