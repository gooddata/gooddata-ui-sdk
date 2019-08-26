// (C) 2007-2018 GoodData Corporation
import { Execution } from "@gooddata/typings";

export const executionRequest = {
    execution: {
        afm: {
            measures: [
                {
                    localIdentifier: "m1",
                    alias: "Primary",
                    definition: {
                        measure: {
                            item: {
                                identifier: "abc",
                            },
                        },
                    },
                },
                {
                    localIdentifier: "m2",
                    alias: "Secondary",
                    definition: {
                        measure: {
                            item: {
                                identifier: "def",
                            },
                        },
                    },
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

const executionResponse = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: "Primary",
                                    format: "#,##0.00",
                                    localIdentifier: "m1",
                                    uri: "urim1",
                                    identifier: "idm1",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    name: "Secondary",
                                    format: "#,##0.00",
                                    localIdentifier: "m2",
                                    uri: "urim2",
                                    identifier: "idm2",
                                },
                            },
                        ],
                    },
                },
            ],
        },
    ],
    links: {
        executionResult: "abc",
    },
};

const executionResult = {
    data: ["80406324.96", "36219131.58"],
    headerItems: [
        [
            [
                {
                    measureHeaderItem: {
                        name: "Primary",
                        order: 0,
                    },
                },
                {
                    measureHeaderItem: {
                        name: "Secondary",
                        order: 1,
                    },
                },
            ],
        ],
    ],
    paging: {
        count: [2],
        offset: [0],
        total: [2],
    },
};

export const executionResponses: Execution.IExecutionResponses = {
    executionResponse,
    executionResult,
};
