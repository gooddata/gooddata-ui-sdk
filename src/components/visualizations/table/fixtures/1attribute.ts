// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { TableRow } from "../../../../interfaces/Table";

export const EXECUTION_REQUEST_1A: AFM.IExecution = {
    execution: {
        afm: {
            attributes: [
                {
                    localIdentifier: "1st_attr_df_local_identifier",
                    displayForm: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
                    },
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["1st_attr_df_local_identifier"],
                },
                {
                    itemIdentifiers: [],
                },
            ],
        },
    },
};

export const EXECUTION_RESPONSE_1A: Execution.IExecutionResponse = {
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
                    },
                },
            ],
        },
        {
            headers: [], // empty array => empty 1-st dimension
        },
    ],
    links: {
        executionResult:
            "/gdc/app/projects/project_id/executionResults/foo?q=bar&c=baz&dimension=a&dimension=m",
    },
};

export const EXECUTION_RESULT_1A: Execution.IExecutionResult = {
    data: [],
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
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=12",
                        name: "Television",
                    },
                },
            ],
        ],
        [], // empty array => empty 1-st dimension
    ],
    paging: {
        count: [2, 1],
        offset: [0, 0],
        total: [2, 1],
    },
};

export const TABLE_HEADERS_1A: IMappingHeader[] = [
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
        },
    },
];

export const TABLE_ROWS_1A: TableRow[] = [
    [
        {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=3",
            name: "Computer",
        },
    ],
    [
        {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=12",
            name: "Television",
        },
    ],
];
