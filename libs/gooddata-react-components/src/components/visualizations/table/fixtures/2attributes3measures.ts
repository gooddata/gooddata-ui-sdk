// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { TableRow } from "../../../../interfaces/Table";

export const EXECUTION_REQUEST_2A_3M: AFM.IExecution = {
    execution: {
        afm: {
            attributes: [
                {
                    localIdentifier: "1st_attr_df_local_identifier",
                    displayForm: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
                    },
                },
                {
                    localIdentifier: "2nd_attr_df_local_identifier",
                    displayForm: {
                        identifier: "2nd_attr_df_identifier",
                    },
                },
            ],
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
                {
                    localIdentifier: "3rd_measure_local_identifier",
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/project_id/obj/3rd_measure_uri_id",
                            },
                        },
                    },
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["1st_attr_df_local_identifier", "2nd_attr_df_local_identifier"],
                    totals: [
                        {
                            measureIdentifier: "3rd_measure_local_identifier",
                            type: "sum",
                            attributeIdentifier: "1st_attr_local_identifier",
                        },
                        {
                            measureIdentifier: "1st_measure_local_identifier",
                            type: "avg",
                            attributeIdentifier: "1st_attr_local_identifier",
                        },
                        {
                            measureIdentifier: "2nd_measure_local_identifier",
                            type: "nat",
                            attributeIdentifier: "1st_attr_local_identifier",
                        },
                    ],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

export const EXECUTION_RESPONSE_2A_3M: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    attributeHeader: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
                        identifier: "1st_attr_df_identifier",
                        localIdentifier: "1st_attr_df_local_identifier",
                        name: "Product Name",
                        formOf: {
                            name: "Product",
                            uri: "/gdc/md/project_id/obj/1st_attr_uri_id",
                            identifier: "1st_attr_local_identifier",
                        },
                        totalItems: [
                            {
                                totalHeaderItem: {
                                    name: "sum",
                                },
                            },
                            {
                                totalHeaderItem: {
                                    name: "avg",
                                },
                            },
                            {
                                totalHeaderItem: {
                                    name: "nat",
                                },
                            },
                        ],
                    },
                },
                {
                    attributeHeader: {
                        uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id",
                        identifier: "2nd_attr_df_identifier",
                        localIdentifier: "2nd_attr_df_local_identifier",
                        name: "Region Area",
                        formOf: {
                            name: "Region",
                            uri: "/gdc/md/project_id/obj/2nd_attr_uri_id",
                            identifier: "2nd_attr_local_identifier",
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
                            {
                                measureHeaderItem: {
                                    uri: "/gdc/md/project_id/obj/3rd_measure_uri_id",
                                    identifier: "3rd_measure_identifier",
                                    localIdentifier: "3rd_measure_local_identifier",
                                    name: "Expected",
                                    format: "[backgroundColor=ffff00][red]$#,##0.00",
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

export const EXECUTION_RESULT_2A_3M: Execution.IExecutionResult = {
    data: [
        ["1953605.55", "2115472", null],
        ["10711626.9", "7122497.87", null],
        ["2167802.76", "2307461.24", null],
        ["7557512.72", "6550145.82", null],
    ],
    headerItems: [
        [
            [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=3",
                        name: "Computer",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=3",
                        name: "Computer",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=12",
                        name: "Television",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=12",
                        name: "Television",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "sum",
                        type: "sum",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "avg",
                        type: "avg",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "nat",
                        type: "nat",
                    },
                },
            ],
            [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=71",
                        name: "East Coast",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=67",
                        name: "West Coast",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=71",
                        name: "East Coast",
                    },
                },
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=67",
                        name: "West Coast",
                    },
                },
            ],
        ],
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
                {
                    measureHeaderItem: {
                        name: "Expected",
                        order: 2,
                    },
                },
            ],
        ],
    ],
    totals: [[[null, null, null], ["5726498.93", null, null], [null, "17000001", null]]],
    paging: {
        count: [4, 3],
        offset: [0, 0],
        total: [4, 3],
    },
};

export const TABLE_HEADERS_2A_3M: IMappingHeader[] = [
    {
        attributeHeader: {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
            identifier: "1st_attr_df_identifier",
            localIdentifier: "1st_attr_df_local_identifier",
            name: "Product Name",
            formOf: {
                uri: "/gdc/md/project_id/obj/1st_attr_uri_id",
                identifier: "1st_attr_local_identifier",
                name: "Product",
            },
            totalItems: [
                {
                    totalHeaderItem: {
                        name: "sum",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "avg",
                    },
                },
                {
                    totalHeaderItem: {
                        name: "nat",
                    },
                },
            ],
        },
    },
    {
        attributeHeader: {
            uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id",
            identifier: "2nd_attr_df_identifier",
            localIdentifier: "2nd_attr_df_local_identifier",
            name: "Region Area",
            formOf: {
                uri: "/gdc/md/project_id/obj/2nd_attr_uri_id",
                identifier: "2nd_attr_local_identifier",
                name: "Region",
            },
        },
    },
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
    {
        measureHeaderItem: {
            uri: "/gdc/md/project_id/obj/3rd_measure_uri_id",
            identifier: "3rd_measure_identifier",
            localIdentifier: "3rd_measure_local_identifier",
            name: "Expected",
            format: "[backgroundColor=ffff00][red]$#,##0.00",
        },
    },
];

export const TABLE_ROWS_2A_3M: TableRow[] = [
    [
        {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=3",
            name: "Computer",
        },
        {
            uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=71",
            name: "East Coast",
        },
        "1953605.55",
        "2115472",
        null,
    ],
    [
        {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=3",
            name: "Computer",
        },
        {
            uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=67",
            name: "West Coast",
        },
        "10711626.9",
        "7122497.87",
        null,
    ],
    [
        {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=12",
            name: "Television",
        },
        {
            uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=71",
            name: "East Coast",
        },
        "2167802.76",
        "2307461.24",
        null,
    ],
    [
        {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=12",
            name: "Television",
        },
        {
            uri: "/gdc/md/project_id/obj/2nd_attr_df_uri_id/elements?id=67",
            name: "West Coast",
        },
        "7557512.72",
        "6550145.82",
        null,
    ],
];
