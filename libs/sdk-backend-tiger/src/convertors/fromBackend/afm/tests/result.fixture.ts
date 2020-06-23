// (C) 2020 GoodData Corporation
import { IDimensionDescriptor } from "@gooddata/sdk-backend-spi";
import { Execution } from "@gooddata/api-client-tiger";

export const mockResult: Execution.IExecutionResult = {
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
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "1910-1",
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
                    formOf: {
                        identifier: "event_date.quarter",
                        uri: "bar",
                        name: "event_date - Quarter/Year",
                    },
                },
            },
        ],
    },
];
