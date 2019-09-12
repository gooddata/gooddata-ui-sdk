// (C) 2007-2018 GoodData Corporation
export const SINGLE_URI_METRIC_EXECUTION_REQUEST = {
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

export const SINGLE_IDENTIFIER_METRIC_EXECUTION_REQUEST = {
    afm: {
        measures: [
            {
                localIdentifier: "m1",
                definition: {
                    measure: {
                        item: {
                            identifier: "metric.lost",
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

export const SINGLE_ADHOC_MEASURE_EXECUTION_REQUEST = {
    afm: {
        measures: [
            {
                localIdentifier: "m1",
                definition: {
                    measure: {
                        item: {
                            uri: "/gdc/md/project_id/obj/1",
                        },
                        aggregation: "count",
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

export const SINGLE_METRIC_EXECUTION_RESPONSE = {
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
                                    identifier: "metric.lost",
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

export const SINGLE_ADHOC_METRIC_EXECUTION_RESPONSE = {
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

export const SINGLE_METRIC_EXECUTION_RESULT = {
    data: ["42470571.16"],
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

export const SINGLE_ADHOC_METRIC_EXECUTION_RESULT = {
    data: ["42470571.16"],
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
