// (C) 2024 GoodData Corporation

import { IFilterContext } from "@gooddata/sdk-model";

export const filterContext: IFilterContext = {
    ref: { identifier: "1c07035a-d48c-48f9-97ac-ca6a146a1b17", type: "filterContext" },
    identifier: "1c07035a-d48c-48f9-97ac-ca6a146a1b17",
    uri: "https://internal-testing.staging.stg11.panther.intgdc.com/api/v1/entities/workspaces/130ee9a3d69b4508aed431773a660706/filterContexts/1c07035a-d48c-48f9-97ac-ca6a146a1b17",
    title: "filterContext",
    description: "",
    filters: [
        {
            dateFilter: {
                granularity: "GDC.time.date",
                type: "absolute",
                from: "2024-08-12",
                to: "2024-09-12",
            },
        },
        {
            attributeFilter: {
                attributeElements: { uris: ["Content"] },
                displayForm: { identifier: "campaign_channels.category", type: "displayForm" },
                negativeSelection: false,
                localIdentifier: "86e90c9b864e4701affced5e55b36b9c",
                selectionMode: "single",
            },
        },
        {
            attributeFilter: {
                attributeElements: { uris: ["South"] },
                displayForm: { identifier: "region", type: "displayForm" },
                negativeSelection: false,
                localIdentifier: "a01fc28d9a8244b99179d3f7320b3400",
                selectionMode: "multi",
            },
        },
        {
            attributeFilter: {
                attributeElements: { uris: ["A", "B"] },
                displayForm: { identifier: "negative-filter", type: "displayForm" },
                negativeSelection: true,
                localIdentifier: "b01fc28d9a8244b99179d3f7320b3400",
                selectionMode: "multi",
            },
        },
        {
            dateFilter: {
                dataSet: { identifier: "date", type: "dataSet" },
                type: "absolute",
                granularity: "GDC.time.date",
                from: "2021-08-12",
                to: "2021-09-12",
            },
        },
        {
            dateFilter: {
                dataSet: { identifier: "ignored", type: "dataSet" },
                type: "absolute",
                granularity: "GDC.time.date",
                from: "2023-06-10",
                to: "2023-02-11",
            },
        },
        {
            attributeFilter: {
                attributeElements: { uris: [] },
                displayForm: { identifier: "order_id", type: "displayForm" },
                negativeSelection: true,
                localIdentifier: "87fbd090f82a4425822ecf19f4f9e123",
                selectionMode: "multi",
            },
        },
    ],
};
