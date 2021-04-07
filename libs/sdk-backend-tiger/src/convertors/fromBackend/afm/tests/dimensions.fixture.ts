// (C) 2020-2021 GoodData Corporation
import { ResultDimension } from "@gooddata/api-client-tiger";

export const mockDimensions: ResultDimension[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    measureGroupHeaderItems: [
                        {
                            localIdentifier: "measureLocalId",
                            format: "#,##0.00",
                        },
                    ],
                },
            },
        ],
    },
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "fd48e8fd32b54b1baba3e3ccdd719f26",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                },
            },
        ],
    },
];

export const mockMultipleDimensions: ResultDimension[] = [
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "localAttr1",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                },
            },
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "localAttr2",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                },
            },
        ],
    },
    {
        headers: [
            {
                measureGroupHeader: {
                    measureGroupHeaderItems: [
                        {
                            localIdentifier: "measureLocalId",
                            format: "#,##0.00",
                        },
                    ],
                },
            },
        ],
    },
    {
        headers: [
            {
                attributeHeader: {
                    label: { id: "event_date.quarter.label", type: "label" },
                    localIdentifier: "localAttr3",
                    labelName: "event_date - Quarter/Year",
                    primaryLabel: { id: "event_date.quarter", type: "label" },
                    attribute: { id: "event_date.quarter", type: "attribute" },
                    attributeName: "event_date - Quarter/Year",
                },
            },
        ],
    },
];
