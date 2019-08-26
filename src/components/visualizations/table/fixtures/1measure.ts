// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { TableRow } from "../../../../interfaces/Table";

export const EXECUTION_REQUEST_1M: AFM.IExecution = {
    execution: {
        afm: {
            measures: [
                {
                    localIdentifier: "1st_measure_local_identifier",
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/project_id/obj/1st_measure_uri_id",
                            },
                        },
                    },
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

export const EXECUTION_RESPONSE_1M: Execution.IExecutionResponse = {
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
                                    uri: "/gdc/md/project_id/obj/1st_measure_uri_id",
                                    identifier: "1st_measure_identifier",
                                    localIdentifier: "1st_measure_local_identifier",
                                    name: "Lost",
                                    format: "$#,##0.00",
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

export const EXECUTION_RESULT_1M: Execution.IExecutionResult = {
    data: [["42470571.16"]],
    headerItems: [
        [], // empty array => empty 0-st dimension
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
        count: [1, 1],
        offset: [0, 0],
        total: [1, 1],
    },
};

export const TABLE_HEADERS_1M: IMappingHeader[] = [
    {
        measureHeaderItem: {
            uri: "/gdc/md/project_id/obj/1st_measure_uri_id",
            identifier: "1st_measure_identifier",
            localIdentifier: "1st_measure_local_identifier",
            name: "Lost",
            format: "$#,##0.00",
        },
    },
];

export const TABLE_ROWS_1M: TableRow[] = [["42470571.16"]];
