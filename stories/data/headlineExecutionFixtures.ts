// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";

const headlineWithOneMeasureExecutionRequest: AFM.IExecution["execution"] = {
    afm: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    },
                },
                localIdentifier: "lostMetric",
                format: "#,##0.00",
                alias: "Lost",
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
};

const headlineWithOneMeasureExecutionResponse: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: "Lost",
                                    format: "#,##0.00",
                                    localIdentifier: "lostMetric",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                                    identifier: "af2Ewj9Re2vK",
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

const headlineWithOneMeasureExecutionResult: Execution.IExecutionResult = {
    data: [9011389.956],
    headerItems: [
        [
            [
                {
                    measureHeaderItem: {
                        name: "Lost",
                        order: 0,
                    },
                },
            ],
        ],
    ],
    paging: {
        count: [1],
        offset: [0],
        total: [1],
    },
};

const headlineWithTwoMeasuresExecutionRequest: AFM.IExecution["execution"] = {
    afm: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    },
                },
                localIdentifier: "lostMetric",
                format: "#,##0.00",
                alias: "Lost",
            },
            {
                localIdentifier: "lostMetric_pop",
                definition: {
                    popMeasure: {
                        measureIdentifier: "lostMetric",
                        popAttribute: {
                            uri: "/gdc/md/project_id/obj/date_attr_uri_id",
                        },
                    },
                },
                format: "#,##0.00",
                alias: "Lost - Previous year",
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
};

const headlineWithTwoMeasuresExecutionResponse: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: "Lost",
                                    format: "#,##0.00",
                                    localIdentifier: "lostMetric",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                                    identifier: "af2Ewj9Re2vK",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    name: "Lost - Previous year",
                                    format: "#,##0.00",
                                    localIdentifier: "lostMetric_pop",
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

const headlineWithTwoMeasuresExecutionResult: Execution.IExecutionResult = {
    data: [9011389.956, 42470571.16],
    headerItems: [
        [
            [
                {
                    measureHeaderItem: {
                        name: "Lost",
                        order: 0,
                    },
                },
                {
                    measureHeaderItem: {
                        name: "Lost - Previous year",
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

const headlineWithAMMeasureExecutionRequest: AFM.IExecution["execution"] = {
    afm: {
        measures: [
            {
                definition: {
                    measure: {
                        item: {
                            uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        },
                    },
                },
                localIdentifier: "m1",
                format: "#,##0.00",
                alias: "M1",
            },
            {
                definition: {
                    arithmeticMeasure: {
                        measureIdentifiers: ["m1", "m1"],
                        operator: "sum",
                    },
                },
                localIdentifier: "am1",
                format: "#,##0.00",
                alias: "AM1",
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
};

const headlineWithAMMeasureExecutionResponse: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: "M1",
                                    format: "#,##0.00",
                                    localIdentifier: "m1",
                                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                                    identifier: "af2Ewj9Re2vK",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    name: "AM1",
                                    format: "#,##0.00",
                                    localIdentifier: "am1",
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

const headlineWithAMMeasureExecutionResult: Execution.IExecutionResult = {
    data: [4000.2, 8000.4],
    headerItems: [
        [
            [
                {
                    measureHeaderItem: {
                        name: "M1",
                        order: 0,
                    },
                },
                {
                    measureHeaderItem: {
                        name: "AM1",
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

export const headlineWithOneMeasure = {
    executionRequest: headlineWithOneMeasureExecutionRequest,
    executionResponse: headlineWithOneMeasureExecutionResponse,
    executionResult: headlineWithOneMeasureExecutionResult,
};

export const headlineWithTwoMeasures = {
    executionRequest: headlineWithTwoMeasuresExecutionRequest,
    executionResponse: headlineWithTwoMeasuresExecutionResponse,
    executionResult: headlineWithTwoMeasuresExecutionResult,
};

export const headlineWithAMMeasure = {
    executionRequest: headlineWithAMMeasureExecutionRequest,
    executionResponse: headlineWithAMMeasureExecutionResponse,
    executionResult: headlineWithAMMeasureExecutionResult,
};
