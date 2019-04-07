// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { TableRow } from "../../../../interfaces/Table";

export const EXECUTION_REQUEST_2M: AFM.IExecution = {
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
                {
                    localIdentifier: "2nd_measure_local_identifier",
                    definition: {
                        measure: {
                            item: {
                                identifier: "2nd_measure_identifier",
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

export const EXECUTION_RESPONSE_2M: Execution.IExecutionResponse = {
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
                            {
                                measureHeaderItem: {
                                    uri: "/gdc/md/project_id/obj/2nd_measure_uri_id",
                                    identifier: "2nd_measure_identifier",
                                    localIdentifier: "2nd_measure_local_identifier",
                                    name: "Won",
                                    format: "[red]$#,##0.00",
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

export const EXECUTION_RESULT_2M: Execution.IExecutionResult = {
    data: [["42470571.16", "38310753.45"]],
    headerItems: [
        [], // empty array => empty 0-th dimension
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
                        name: "Won",
                        order: 1,
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

export const TABLE_HEADERS_2M: IMappingHeader[] = [
    {
        measureHeaderItem: {
            uri: "/gdc/md/project_id/obj/1st_measure_uri_id",
            identifier: "1st_measure_identifier",
            localIdentifier: "1st_measure_local_identifier",
            name: "Lost",
            format: "$#,##0.00",
        },
    },
    {
        measureHeaderItem: {
            uri: "/gdc/md/project_id/obj/2nd_measure_uri_id",
            identifier: "2nd_measure_identifier",
            localIdentifier: "2nd_measure_local_identifier",
            name: "Won",
            format: "[red]$#,##0.00",
        },
    },
];

export const TABLE_ROWS_2M: TableRow[] = [["42470571.16", "38310753.45"]];
