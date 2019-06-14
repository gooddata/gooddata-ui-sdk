// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { IIdentifierUriPair } from "../../../interfaces";

export const m1Uri = "/gdc/md/projectId/obj/1";
export const m2Uri = "/gdc/md/projectId/obj/2";
export const m1Identifier = "ident1";
export const m2Identifier = "ident2";
export const m1Format = "#.##1";
export const m2Format = "#.##2";
export const m1Title = "Metric 1";
export const m2Title = "Metric 2";

export const getObjectsMockedResponse = [
    {
        metric: {
            content: {
                format: m1Format,
            },
            meta: {
                title: m1Title,
                uri: m1Uri,
            },
        },
    },
    {
        metric: {
            content: {
                format: m2Format,
            },
            meta: {
                title: m2Title,
                uri: m2Uri,
            },
        },
    },
];

export const getUrisFromIdentifiersResponse: IIdentifierUriPair[] = [
    {
        uri: m1Uri,
        identifier: m1Identifier,
    },
    {
        uri: m2Uri,
        identifier: m2Identifier,
    },
];

export const afmWithIdentifiers: AFM.IAfm = {
    measures: [
        {
            localIdentifier: "m1",
            definition: {
                measure: {
                    item: {
                        identifier: m1Identifier,
                    },
                },
            },
        },
        {
            localIdentifier: "m2",
            definition: {
                measure: {
                    item: {
                        identifier: m2Identifier,
                    },
                },
            },
        },
    ],
};

export const afmWithUris: AFM.IAfm = {
    measures: [
        {
            localIdentifier: "m1",
            definition: {
                measure: {
                    item: {
                        uri: m1Uri,
                    },
                },
            },
        },
        {
            localIdentifier: "m2",
            definition: {
                measure: {
                    item: {
                        uri: m2Uri,
                    },
                },
            },
        },
    ],
};

export const afmWithUrisAndIdentifiers: AFM.IAfm = {
    measures: [
        {
            localIdentifier: "m1",
            definition: {
                measure: {
                    item: {
                        uri: m1Uri,
                    },
                },
            },
        },
        {
            localIdentifier: "m2",
            definition: {
                measure: {
                    item: {
                        identifier: m2Identifier,
                    },
                },
            },
        },
    ],
};
