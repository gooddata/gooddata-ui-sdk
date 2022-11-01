// (C) 2020-2022 GoodData Corporation
import { ExecutionResult } from "@gooddata/api-client-tiger";
import { idRef, IDimensionDescriptor } from "@gooddata/sdk-model";

export const mockResult: ExecutionResult = {
    data: [["20.0", "40.2"]],
    dimensionHeaders: [
        {
            headerGroups: [
                {
                    headers: [
                        {
                            measureHeader: {
                                measureIndex: 0,
                            },
                        },
                    ],
                },
            ],
        },
        {
            headerGroups: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "1906-4",
                                primaryLabelValue: "1906-4",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "1910-1",
                                primaryLabelValue: "1910-1",
                            },
                        },
                    ],
                },
            ],
        },
    ],
    paging: {
        count: [1, 2],
        offset: [0, 0],
        total: [1, 2],
    },
    grandTotals: [],
};

export const mockDimensions: IDimensionDescriptor[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "cdc3d26d8b2d469eb73b61a07d2abc2d",
                                name: "Sum of duration",
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
                    uri: "foo",
                    ref: idRef("event_date.quarter.label"),
                    formOf: {
                        identifier: "event_date.quarter",
                        uri: "bar",
                        name: "event_date - Quarter/Year",
                        ref: idRef("event_date.quarter"),
                    },
                },
            },
        ],
    },
];

export const mockDimensionsWithDateFormat: IDimensionDescriptor[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "cdc3d26d8b2d469eb73b61a07d2abc2d",
                                name: "Sum of duration",
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
                    uri: "foo",
                    ref: idRef("event_date.quarter.label"),
                    formOf: {
                        identifier: "event_date.quarter",
                        uri: "bar",
                        name: "event_date - Quarter/Year",
                        ref: idRef("event_date.quarter"),
                    },
                    granularity: "QUARTER",
                    format: {
                        locale: "cs-CZ",
                        pattern: "'Q'Q y",
                    },
                },
            },
        ],
    },
];
