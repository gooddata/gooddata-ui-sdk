// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";

export const TWO_MEASURES_WITH_URI_EXECUTION_REQUEST: AFM.IExecution["execution"] = {
    afm: {
        measures: [
            {
                localIdentifier: "m1",
                definition: {
                    measure: {
                        item: {
                            uri: "/gdc/md/project_id/obj/1",
                        },
                    },
                },
            },
            {
                localIdentifier: "m2",
                definition: {
                    measure: {
                        item: {
                            uri: "/gdc/md/project_id/obj/2",
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
};

export const TWO_MEASURES_WITH_IDENTIFIER_EXECUTION_REQUEST: AFM.IExecution["execution"] = {
    afm: {
        measures: [
            {
                localIdentifier: "m1",
                definition: {
                    measure: {
                        item: {
                            identifier: "measure.lost",
                        },
                    },
                },
            },
            {
                localIdentifier: "m2",
                definition: {
                    measure: {
                        item: {
                            identifier: "measure.found",
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
};

export const TWO_MEASURES_EXECUTION_RESPONSE: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: [
                            {
                                measureHeaderItem: {
                                    name: "Lost",
                                    format: "$#,##0.00",
                                    localIdentifier: "m1",
                                    uri: "/gdc/md/project_id/obj/1",
                                    identifier: "measure.lost",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    name: "Found",
                                    format: "$#,##0.00",
                                    localIdentifier: "m2",
                                },
                            },
                        ],
                    },
                },
            ],
        },
    ],
    links: {
        executionResult:
            "/gdc/app/projects/project_id/executionResults/foo?q=bar&c=baz&dimension=a&dimension=m",
    },
};

export const TWO_MEASURES_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: ["42470571.16", "12345678"],
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
                        name: "Found",
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

export const EMPTY_FIRST_MEASURE_VALUE_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: [null, "12345678"],
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
                        name: "Found",
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

export const EMPTY_SECOND_MEASURE_VALUE_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: ["42470571.16", null],
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
                        name: "Found",
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

export const EMPTY_MEASURE_VALUES_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: [null, null],
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
                        name: "Found",
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

export const ZERO_FIRST_MEASURE_VALUE_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: ["0", "12345678"],
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
                        name: "Found",
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

export const ZERO_SECOND_MEASURE_VALUE_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: ["42470571.16", "0"],
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
                        name: "Found",
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

export const SAME_MEASURE_VALUES_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: ["1234", "1234"],
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
                        name: "Found",
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

export const ZERO_MEASURE_VALUES_EXECUTION_RESULT: Execution.IExecutionResult = {
    data: ["0", "0"],
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
                        name: "Found",
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
