// (C) 2020-2021 GoodData Corporation
import { IAvailableDrillTargetMeasure, IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { idRef, localIdRef, ObjRef, uriRef } from "@gooddata/sdk-model";
import {
    IDrillToInsight,
    IDrillToDashboard,
    IDrillToCustomUrl,
    IDrillToAttributeUrl,
} from "@gooddata/sdk-backend-spi";

import {
    IDrillToDashboardConfig,
    DRILL_TARGET_TYPE,
    IDrillToInsightConfig,
    IDrillToCustomUrlConfig,
    IDrillToAttributeUrlConfig,
    IDrillToUrlConfig,
    AttributeDisplayFormType,
} from "../../../interfaces";
import { IAttributeDisplayForm } from "../../../interfaces";

export function testDrillToInsight(localId: string, target: ObjRef | string): IDrillToInsight {
    return {
        transition: "pop-up",
        type: "drillToInsight",
        origin: {
            type: "drillFromMeasure",
            measure: localIdRef(localId),
        },
        target: typeof target === "string" ? uriRef(target) : target,
    };
}

export function testDrillToDashboard(localId: string, target?: ObjRef): IDrillToDashboard {
    return {
        transition: "in-place",
        type: "drillToDashboard",
        origin: {
            type: "drillFromMeasure",
            measure: localIdRef(localId),
        },
        target,
    };
}

export function testDrillToCustomUrl(localId: string, customUrl: string): IDrillToCustomUrl {
    return {
        type: "drillToCustomUrl",
        transition: "new-window",
        origin: {
            type: "drillFromMeasure",
            measure: localIdRef(localId),
        },
        target: {
            url: customUrl,
        },
    };
}

export function testDrillToAttributeUrl(
    localId: string,
    dfRef: ObjRef,
    linkRef: ObjRef,
): IDrillToAttributeUrl {
    return {
        type: "drillToAttributeUrl",
        transition: "new-window",
        origin: {
            type: "drillFromMeasure",
            measure: localIdRef(localId),
        },
        target: {
            displayForm: dfRef,
            hyperlinkDisplayForm: linkRef,
        },
    };
}

export const drillToVisualization: IDrillToInsight = testDrillToInsight(
    "m1",
    uriRef("/gdc/mockproject/obj/123"),
);
export const drillToDashboard: IDrillToDashboard = testDrillToDashboard("m1", idRef("456"));
export const drillToCustomUrl: IDrillToCustomUrl = testDrillToCustomUrl("m1", "https://gooddata.com");
export const drillToAttributeUrl: IDrillToAttributeUrl = testDrillToAttributeUrl(
    "m1",
    uriRef("/gdc/mockproject/obj/10"),
    uriRef("/gdc/mockproject/obj/20"),
);

export const drillToDashboardConfig: IDrillToDashboardConfig = {
    type: "measure",
    localIdentifier: "m1",
    title: "My measure",
    drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
    complete: true,
    dashboard: idRef("123"),
    attributes: [],
};

export const drillToInsightConfig: IDrillToInsightConfig = {
    type: "measure",
    localIdentifier: "m1",
    title: "My measure",
    drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
    complete: true,
    insightRef: uriRef("/gdc/mockproject/obj/123"),
    attributes: [],
};

export const drillToCustomUrlConfig: IDrillToUrlConfig = {
    type: "measure",
    localIdentifier: "m1",
    title: "My measure",
    drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_URL,
    complete: true,
    urlDrillTarget: {
        customUrl: "https://gooddata.com",
    },
    attributes: [],
};

export const drillToAttributeUrlConfig: IDrillToUrlConfig = {
    type: "measure",
    localIdentifier: "m1",
    title: "My measure",
    drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_URL,
    complete: true,
    urlDrillTarget: {
        insightAttributeDisplayForm: {
            uri: "/gdc/mockproject/obj/10",
        },
        drillToAttributeDisplayForm: {
            uri: "/gdc/mockproject/obj/20",
        },
    },
    attributes: [],
};

export const drillToCustomUrlConfigTarget: IDrillToCustomUrlConfig = {
    customUrl: "https://gooddata.com",
};

export const drillToAttributeUrlConfigTarget: IDrillToAttributeUrlConfig = {
    insightAttributeDisplayForm: {
        uri: "/gdc/mockproject/obj/10",
    },
    drillToAttributeDisplayForm: {
        uri: "/gdc/mockproject/obj/20",
    },
};

export const drillablePushData: IAvailableDrillTargetMeasure = {
    measure: {
        measureHeaderItem: {
            localIdentifier: "m1",
            name: "My measure",
            format: "##",
        },
    },
    attributes: [],
};

export const drillablePushDataWithAttributes: IAvailableDrillTargets = {
    measures: [
        {
            measure: {
                measureHeaderItem: {
                    localIdentifier: "m1",
                    name: "My measure",
                    format: "##,#",
                },
            },
            attributes: [
                {
                    attributeHeader: {
                        formOf: {
                            uri: "/gdc/mockproject/obj/1",
                            ref: uriRef("/gdc/mockproject/obj/1"),
                            identifier: "1",
                            name: "attribute1",
                        },
                        localIdentifier: "a1",
                        uri: "/gdc/mockproject/obj/10",
                        ref: uriRef("/gdc/mockproject/obj/10"),
                        identifier: "10",
                        name: "10",
                    },
                },
                {
                    attributeHeader: {
                        formOf: {
                            uri: "/gdc/mockproject/obj/1",
                            ref: uriRef("/gdc/mockproject/obj/1"),
                            identifier: "1",
                            name: "attribute1",
                        },
                        localIdentifier: "a2",
                        ref: uriRef("/gdc/mockproject/obj/11"),
                        uri: "/gdc/mockproject/obj/11",
                        identifier: "11",
                        name: "11",
                    },
                },
                {
                    attributeHeader: {
                        formOf: {
                            ref: uriRef("/gdc/mockproject/obj/2"),
                            uri: "/gdc/mockproject/obj/2",
                            identifier: "2",
                            name: "attribute2",
                        },
                        localIdentifier: "a3",
                        uri: "/gdc/mockproject/obj/20",
                        ref: uriRef("/gdc/mockproject/obj/20"),
                        identifier: "20",
                        name: "20",
                    },
                },
            ],
        },
    ],
};

export const departmentIdAttributeDisplayForm: IAttributeDisplayForm = {
    formOf: uriRef("/gdc/mockproject/obj/1"),
    identifier: "id10",
    uri: "/gdc/mockproject/obj/10",
    ref: uriRef("/gdc/mockproject/obj/10"),
    displayFormTitle: "Department ID",
    attributeTitle: "Department",
};

export const departmentNameAttributeDisplayForm: IAttributeDisplayForm = {
    formOf: uriRef("/gdc/mockproject/obj/1"),
    identifier: "id11",
    uri: "/gdc/mockproject/obj/11",
    ref: uriRef("/gdc/mockproject/obj/11"),
    displayFormTitle: "Department name",
    attributeTitle: "Department",
};

export const countryAttributeDisplayForm: IAttributeDisplayForm = {
    formOf: uriRef("/gdc/mockproject/obj/2"),
    identifier: "id20",
    uri: "/gdc/mockproject/obj/20",
    ref: uriRef("/gdc/mockproject/obj/20"),
    displayFormTitle: "Country name",
    attributeTitle: "Country",
    type: AttributeDisplayFormType.HYPERLINK,
};
