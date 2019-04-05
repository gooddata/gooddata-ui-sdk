// (C) 2007-2018 GoodData Corporation
// from indigo-visualizations/stories/test_data/bar_chart_with_view_by_attribute

import { AFM, Execution } from "@gooddata/typings";

export const executionRequest = {
    execution: {
        afm: {
            measures: [
                {
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279",
                            },
                        },
                    },
                    localIdentifier: "amountMetric",
                    format: "#,##0.00",
                    alias: "Amount",
                },
            ],
            attributes: [
                {
                    displayForm: {
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027",
                    },
                    localIdentifier: "departmentAttribute",
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["departmentAttribute"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

export const executionRequestWithoutMeasureAndWithoutResultSpec = {
    execution: {
        afm: {
            attributes: [
                {
                    displayForm: {
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027",
                    },
                    localIdentifier: "departmentAttribute",
                },
            ],
        },
    },
};

export const executionRequestWithEmptyMeasuresArray: AFM.IExecution = {
    execution: {
        afm: {
            attributes: [
                {
                    displayForm: {
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027",
                    },
                    localIdentifier: "departmentAttribute",
                },
            ],
            measures: [],
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
                                    name: "Amount",
                                    format: "#,##0.00",
                                    localIdentifier: "amountMetric",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279",
                                    identifier: "ah1EuQxwaCqs",
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
                        name: "Department",
                        localIdentifier: "departmentAttribute",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027",
                        identifier: "label.owner.department",
                        formOf: {
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1026",
                            identifier: "department",
                            name: "Department",
                        },
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
    data: [["80406324.96", "36219131.58"]],
    headerItems: [
        [],
        [
            [
                {
                    attributeHeaderItem: {
                        name: "Direct Sales",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027/elements?id=1226",
                    },
                },
                {
                    attributeHeaderItem: {
                        name: "Inside Sales",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027/elements?id=1234",
                    },
                },
            ],
        ],
    ],
    paging: {
        count: [1, 2],
        offset: [0, 0],
        total: [1, 2],
    },
};

export const executionResponses: Execution.IExecutionResponses = {
    executionResponse,
    executionResult,
};

// different order of headers for table
export const executionResponsesTable: Execution.IExecutionResponses = {
    executionResponse: {
        dimensions: [
            {
                headers: [
                    {
                        attributeHeader: {
                            name: "Department",
                            localIdentifier: "departmentAttribute",
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1027",
                            identifier: "label.owner.department",
                            formOf: {
                                uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1026",
                                identifier: "department",
                                name: "Department",
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
                                        name: "Amount",
                                        format: "#,##0.00",
                                        localIdentifier: "amountMetric",
                                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1279",
                                        identifier: "ah1EuQxwaCqs",
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
    },
    executionResult,
};
