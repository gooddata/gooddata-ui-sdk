// (C) 2019 GoodData Corporation
import { AFM } from "@gooddata/typings";

const withoutTotals: AFM.IExecution = {
    execution: {
        afm: {
            measures: [
                {
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/project/obj/1279",
                            },
                        },
                    },
                    localIdentifier: "m1",
                },
                {
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/project/obj/1280",
                            },
                        },
                    },
                    localIdentifier: "m2",
                },
            ],
            attributes: [
                {
                    displayForm: {
                        uri: "/gdc/md/project/obj/1027",
                    },
                    localIdentifier: "a1",
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

const withTotals: AFM.IExecution = {
    execution: {
        afm: {
            measures: [
                {
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/project/obj/1279",
                            },
                        },
                    },
                    localIdentifier: "m1",
                },
                {
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/project/obj/1280",
                            },
                        },
                    },
                    localIdentifier: "m2",
                },
            ],
            attributes: [
                {
                    displayForm: {
                        uri: "/gdc/md/project/obj/1027",
                    },
                    localIdentifier: "a1",
                },
            ],
            nativeTotals: [
                {
                    measureIdentifier: "m2",
                    attributeIdentifiers: [],
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["a1"],
                    totals: [
                        {
                            measureIdentifier: "m1",
                            type: "sum",
                            attributeIdentifier: "a1",
                        },
                        {
                            measureIdentifier: "m2",
                            type: "sum",
                            attributeIdentifier: "a1",
                        },
                        {
                            measureIdentifier: "m1",
                            type: "avg",
                            attributeIdentifier: "a1",
                        },
                        {
                            measureIdentifier: "m2",
                            type: "nat",
                            attributeIdentifier: "a1",
                        },
                    ],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

export const executionObjectMock = {
    withTotals,
    withoutTotals,
};
