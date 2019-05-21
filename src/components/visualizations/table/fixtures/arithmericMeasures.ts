// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";

export const EXECUTION_REQUEST_AM: AFM.IExecution = {
    execution: {
        afm: {
            measures: [
                {
                    localIdentifier: "m0",
                    definition: {
                        measure: {
                            item: {
                                uri: "/m0uri",
                            },
                        },
                    },
                },
                {
                    localIdentifier: "m1",
                    definition: {
                        measure: {
                            item: {
                                identifier: "m1id",
                            },
                        },
                    },
                },
                {
                    localIdentifier: "m2",
                    definition: {
                        measure: {
                            item: {
                                identifier: "m2id",
                            },
                        },
                    },
                },
                {
                    localIdentifier: "am1",
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: ["m1", "m2"],
                            operator: "sum",
                        },
                    },
                },
                {
                    localIdentifier: "am2",
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: ["am1", "m2"],
                            operator: "sum",
                        },
                    },
                },
                {
                    localIdentifier: "am3",
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: ["m0", "m2"],
                            operator: "sum",
                        },
                    },
                },
                {
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "am1",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "/m0uri",
                                    },
                                    periodsAgo: 1,
                                },
                            ],
                        },
                    },
                    localIdentifier: "dam1",
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

export const TABLE_HEADERS_AM: Execution.IMeasureHeaderItem[] = [
    {
        measureHeaderItem: {
            uri: "/m0uri",
            identifier: "m0id",
            localIdentifier: "m0",
            name: "M0",
            format: "#,##0",
        },
    },
    {
        measureHeaderItem: {
            uri: "/m1uri",
            identifier: "m1id",
            localIdentifier: "m1",
            name: "M1",
            format: "#,##0",
        },
    },
    {
        measureHeaderItem: {
            uri: "/m2uri",
            identifier: "m2id",
            localIdentifier: "m2",
            name: "M2",
            format: "#,##0",
        },
    },
    {
        measureHeaderItem: {
            localIdentifier: "am1",
            name: "AM1(M1,M2)",
            format: "#,##0",
        },
    },
    {
        measureHeaderItem: {
            localIdentifier: "am2",
            name: "AM2(AM1,M2)",
            format: "#,##0",
        },
    },
    {
        measureHeaderItem: {
            localIdentifier: "am3",
            name: "AM3(M0,M2)",
            format: "#,##0",
        },
    },
    {
        measureHeaderItem: {
            localIdentifier: "dam1",
            name: "DAM1(AM1)",
            format: "#,##0",
        },
    },
];

export const EXECUTION_RESPONSE_AM: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [], // empty array => empty 0-th dimension
        },
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    uri: "/m0uri",
                                    identifier: "m0id",
                                    localIdentifier: "m0",
                                    name: "M0",
                                    format: "#,##0",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    uri: "/m1uri",
                                    identifier: "m1id",
                                    localIdentifier: "m1",
                                    name: "M1",
                                    format: "#,##0",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    uri: "/m2uri",
                                    identifier: "m2id",
                                    localIdentifier: "m2",
                                    name: "M2",
                                    format: "#,##0",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    localIdentifier: "am1",
                                    name: "AM1(M1,M2)",
                                    format: "#,##0",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    localIdentifier: "am2",
                                    name: "AM2(AM1,M2)",
                                    format: "#,##0",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    localIdentifier: "am3",
                                    name: "AM3(M0,A2)",
                                    format: "#,##0",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    localIdentifier: "dam1",
                                    name: "DAM1(AM1)",
                                    format: "#,##0",
                                },
                            },
                        ],
                    },
                },
            ],
        },
    ],
    links: {
        executionResult: "/amExecutionResultUri",
    },
};

export const EXECUTION_RESULT_AM: Execution.IExecutionResult = {
    data: [["0", "1", "2", "3", "4", "5", "6"]],
    headerItems: [
        [], // empty array => empty 0-th dimension
        [
            [
                {
                    measureHeaderItem: {
                        name: TABLE_HEADERS_AM[0].measureHeaderItem.name,
                        order: 0,
                    },
                },
                {
                    measureHeaderItem: {
                        name: TABLE_HEADERS_AM[1].measureHeaderItem.name,
                        order: 1,
                    },
                },
                {
                    measureHeaderItem: {
                        name: TABLE_HEADERS_AM[2].measureHeaderItem.name,
                        order: 2,
                    },
                },
                {
                    measureHeaderItem: {
                        name: TABLE_HEADERS_AM[3].measureHeaderItem.name,
                        order: 3,
                    },
                },
                {
                    measureHeaderItem: {
                        name: TABLE_HEADERS_AM[4].measureHeaderItem.name,
                        order: 4,
                    },
                },
                {
                    measureHeaderItem: {
                        name: TABLE_HEADERS_AM[5].measureHeaderItem.name,
                        order: 5,
                    },
                },
                {
                    measureHeaderItem: {
                        name: TABLE_HEADERS_AM[6].measureHeaderItem.name,
                        order: 6,
                    },
                },
            ],
        ],
    ],
    paging: {
        count: [1, TABLE_HEADERS_AM.length],
        offset: [0, 0],
        total: [1, TABLE_HEADERS_AM.length],
    },
};
