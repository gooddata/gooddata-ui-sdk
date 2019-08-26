// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "../../../../interfaces/MappingHeader";
import { TableRow } from "../../../../interfaces/Table";

export const EXECUTION_REQUEST_1A_2M: AFM.IExecution = {
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
                    format: "#,##0",
                },
                {
                    localIdentifier: "2nd_measure_local_identifier",
                    definition: {
                        measure: {
                            item: {
                                uri: "/gdc/md/project_id/obj/2nd_measure_uri_id",
                            },
                        },
                    },
                    format: "[red]#,##0",
                },
            ],
        },
        resultSpec: {
            dimensions: [
                {
                    itemIdentifiers: ["1st_attr_df_local_identifier"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ],
        },
    },
};

export const EXECUTION_RESPONSE_1A_2M: Execution.IExecutionResponse = {
    dimensions: [
        {
            headers: [
                {
                    attributeHeader: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
                        identifier: "1st_attr_df_identifier",
                        localIdentifier: "1st_attr_df_local_identifier",
                        name: "Full Name",
                        formOf: {
                            name: "Name",
                            uri: "/gdc/md/project_id/obj/1st_attr_uri_id",
                            identifier: "1st_attr_local_identifier",
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
                                    name: "# of Open Opps.",
                                    format: "#,##0",
                                },
                            },
                            {
                                measureHeaderItem: {
                                    uri: "/gdc/md/project_id/obj/2nd_measure_uri_id",
                                    identifier: "2nd_measure_identifier",
                                    localIdentifier: "2nd_measure_local_identifier",
                                    name: "# of Opportunities",
                                    format: "[red]#,##0",
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

export const EXECUTION_RESULT_1A_2M: Execution.IExecutionResult = {
    data: [["30", "1324"]],
    headerItems: [
        [
            [
                {
                    attributeHeaderItem: {
                        uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=1",
                        name: "Wile E. Coyote",
                    },
                },
            ],
        ],
        [
            [
                {
                    measureHeaderItem: {
                        name: "# of Open Opps.",
                        order: 0,
                    },
                },
                {
                    measureHeaderItem: {
                        name: "# of Opportunities",
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

export const TABLE_HEADERS_1A_2M: IMappingHeader[] = [
    {
        attributeHeader: {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id",
            identifier: "1st_attr_df_identifier",
            localIdentifier: "1st_attr_df_local_identifier",
            name: "Full Name",
            formOf: {
                uri: "/gdc/md/project_id/obj/1st_attr_uri_id",
                identifier: "1st_attr_local_identifier",
                name: "Name",
            },
        },
    },
    {
        measureHeaderItem: {
            uri: "/gdc/md/project_id/obj/1st_measure_uri_id",
            identifier: "1st_measure_identifier",
            localIdentifier: "1st_measure_local_identifier",
            name: "# of Open Opps.",
            format: "#,##0",
        },
    },
    {
        measureHeaderItem: {
            uri: "/gdc/md/project_id/obj/2nd_measure_uri_id",
            identifier: "2nd_measure_identifier",
            localIdentifier: "2nd_measure_local_identifier",
            name: "# of Opportunities",
            format: "[red]#,##0",
        },
    },
];

export const TABLE_ROWS_1A_2M: TableRow[] = [
    [
        {
            uri: "/gdc/md/project_id/obj/1st_attr_df_uri_id/elements?id=1",
            name: "Wile E. Coyote",
        },
        "30",
        "1324",
    ],
];
