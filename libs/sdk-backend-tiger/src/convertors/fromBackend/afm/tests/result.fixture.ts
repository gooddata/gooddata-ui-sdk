// (C) 2020-2025 GoodData Corporation
import { ExecutionResult } from "@gooddata/api-client-tiger";
import { idRef, IDimensionDescriptor, ObjRef } from "@gooddata/sdk-model";

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
    metadata: {
        dataSourceMessages: [],
    },
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
                    primaryLabel: undefined as unknown as ObjRef,
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
                    primaryLabel: undefined as unknown as ObjRef,
                },
            },
        ],
    },
];

export const mockDimensionsWithTotals: IDimensionDescriptor[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "m1",
                                name: "Sum of duration",
                                format: "#,##0.00",
                            },
                        },
                        {
                            measureHeaderItem: {
                                localIdentifier: "m2",
                                name: "Sum of amount",
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
                    primaryLabel: undefined as unknown as ObjRef,
                },
            },
        ],
    },
];

export const mockResultWithTotals: ExecutionResult = {
    data: [["1", "2", "3", "4", "5"]],
    dimensionHeaders: [
        {
            headerGroups: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "First",
                                primaryLabelValue: "FirstLabel",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Second",
                                primaryLabelValue: "SecondLabel",
                            },
                        },
                        {
                            totalHeader: {
                                function: "sum",
                            },
                        },
                        {
                            totalHeader: {
                                function: "sum",
                            },
                        },
                        {
                            totalHeader: {
                                function: "max",
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
                            measureHeader: {
                                measureIndex: 0,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 1,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 0,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 1,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 1,
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
    metadata: {
        dataSourceMessages: [],
    },
};
