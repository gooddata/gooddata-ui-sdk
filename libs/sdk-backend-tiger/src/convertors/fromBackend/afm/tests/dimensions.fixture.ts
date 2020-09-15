// (C) 2020 GoodData Corporation
import { Execution } from "@gooddata/api-client-tiger";

export const mockDimensions: Execution.IResultDimension[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "measureLocalId",
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
                    formOf: {
                        identifier: "event_date.quarter",
                        name: "event_date - Quarter/Year",
                    },
                },
            },
        ],
    },
];
