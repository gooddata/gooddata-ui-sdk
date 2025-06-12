// (C) 2021-2022 GoodData Corporation

import { idRef, IFilterContextDefinition } from "@gooddata/sdk-model";

export const TestFilterContext: IFilterContextDefinition = {
    filters: [
        {
            attributeFilter: {
                attributeElements: {
                    uris: [
                        "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169661",
                        "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169658",
                    ],
                },
                displayForm: { uri: "/gdc/md/GoodSalesDemo/obj/1252" },
                negativeSelection: false,
            },
        },
        {
            attributeFilter: {
                attributeElements: { uris: ["/gdc/md/GoodSalesDemo/obj/1026/elements?id=1234"] },
                displayForm: { uri: "/gdc/md/GoodSalesDemo/obj/1027" },
                negativeSelection: true,
            },
        },
    ],
    uri: "TestFilterContext",
    identifier: "TestFilterContext",
    ref: idRef("TestFilterContext"),
    title: "filterContext",
    description: "",
};

export const TestFilterContextWithInvalidParents: IFilterContextDefinition = {
    filters: [
        {
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.date",
            },
        },
        {
            attributeFilter: {
                attributeElements: {
                    uris: [
                        "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169661",
                        "/gdc/md/GoodSalesDemo/obj/1251/elements?id=169658",
                    ],
                },
                displayForm: { uri: "/gdc/md/GoodSalesDemo/obj/1252" },
                localIdentifier: "filter1",
                negativeSelection: false,
            },
        },
        {
            attributeFilter: {
                attributeElements: {
                    uris: ["/gdc/md/GoodSalesDemo/obj/1026/elements?id=1234"],
                },
                displayForm: { uri: "/gdc/md/GoodSalesDemo/obj/1027" },
                localIdentifier: "filter2",
                filterElementsBy: [
                    {
                        filterLocalIdentifier: "filter1",
                        over: {
                            attributes: [{ uri: "/gdc/md/GoodSalesDemo/obj/9999" }],
                        },
                    },
                    {
                        filterLocalIdentifier: "filterWhichIsNotHereAnymore",
                        over: {
                            attributes: [{ uri: "/gdc/md/GoodSalesDemo/obj/8888" }],
                        },
                    },
                ],
                negativeSelection: true,
            },
        },
    ],
    uri: "TestFilterContext",
    identifier: "TestFilterContext",
    ref: idRef("TestFilterContext"),
    title: "filterContext",
    description: "",
};
