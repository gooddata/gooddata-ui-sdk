// (C) 2020-2021 GoodData Corporation
import { ResultDimension } from "@gooddata/api-client-tiger";

export const mockDimensions: ResultDimension[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "measureLocalId",
                                format: "#,##0.00",
                            },
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
                    identifier: "event_date.quarter.label",
                    localIdentifier: "fd48e8fd32b54b1baba3e3ccdd719f26",
                    name: "event_date - Quarter/Year",
                    formOf: {
                        primaryLabelIdentifier: "event_date.quarter",
                        identifier: "event_date.quarter",
                        name: "event_date - Quarter/Year",
                    },
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
                    identifier: "event_date.quarter.label",
                    localIdentifier: "localAttr1",
                    name: "event_date - Quarter/Year",
                    formOf: {
                        primaryLabelIdentifier: "event_date.quarter",
                        identifier: "event_date.quarter",
                        name: "event_date - Quarter/Year",
                    },
                },
            },
            {
                attributeHeader: {
                    identifier: "event_date.quarter.label",
                    localIdentifier: "localAttr2",
                    name: "event_date - Quarter/Year",
                    formOf: {
                        primaryLabelIdentifier: "event_date.quarter",
                        identifier: "event_date.quarter",
                        name: "event_date - Quarter/Year",
                    },
                },
            },
        ],
    },
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "measureLocalId",
                                format: "#,##0.00",
                            },
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
                    identifier: "event_date.quarter.label",
                    localIdentifier: "localAttr3",
                    name: "event_date - Quarter/Year",
                    formOf: {
                        primaryLabelIdentifier: "event_date.quarter",
                        identifier: "event_date.quarter",
                        name: "event_date - Quarter/Year",
                    },
                },
            },
        ],
    },
];
