// (C) 2026 GoodData Corporation

import { type ILocalExecutionRecording } from "../localDataView.fixture.js";

export const ScatterPlotWith2MetricsAndAttributeNullsInData = {
    definition: {
        workspace: "testWorkspace",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "33bd337ed5534fd383861f11ff657b23",
                            alias: "Sum of Amount",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "obj_1144",
                                    },
                                    aggregation: "sum",
                                    filters: [],
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "secondary_measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "88291f6f6fef47a7b9c5ad709af2b45b",
                            alias: "# of Open Opps.",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "obj_13465",
                                    },
                                    filters: [],
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "attribute",
                items: [
                    {
                        attribute: {
                            displayForm: {
                                uri: "obj_952",
                            },
                            localIdentifier: "7369345339414eceaaf67ba05dfe6724",
                        },
                    },
                ],
            },
        ],
        attributes: [
            {
                attribute: {
                    displayForm: {
                        uri: "obj_952",
                    },
                    localIdentifier: "7369345339414eceaaf67ba05dfe6724",
                },
            },
        ],
        measures: [
            {
                measure: {
                    localIdentifier: "33bd337ed5534fd383861f11ff657b23",
                    alias: "Sum of Amount",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1144",
                            },
                            aggregation: "sum",
                            filters: [],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "88291f6f6fef47a7b9c5ad709af2b45b",
                    alias: "# of Open Opps.",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_13465",
                            },
                            filters: [],
                        },
                    },
                },
            },
        ],
        dimensions: [
            {
                itemIdentifiers: ["7369345339414eceaaf67ba05dfe6724"],
            },
            {
                itemIdentifiers: ["measureGroup"],
            },
        ],
        filters: [],
        sortBy: [],
    },
    response: {
        executionResponse: {
            dimensions: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                name: "Product Name",
                                localIdentifier: "7369345339414eceaaf67ba05dfe6724",
                                uri: "obj_952",
                                identifier: "label.product.id.name",
                                formOf: {
                                    name: "Product",
                                    uri: "obj_949",
                                    identifier: "attr.product.id",
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
                                            name: "Sum of Amount",
                                            format: "#,##0.00",
                                            localIdentifier: "33bd337ed5534fd383861f11ff657b23",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "# of Open Opps.",
                                            format: "#,##0",
                                            localIdentifier: "88291f6f6fef47a7b9c5ad709af2b45b",
                                            uri: "obj_13465",
                                            identifier: "aaYh6Voua2yj",
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
                    "/gdc/app/projects/adtxv0e7evvx6dawu7t2jju5a6r73eua/executionResults/7363611803027504128?q=eAGlkc1OwzAQhF%2Blcq5RHdL8KJUQ4gCoF0BAT1UOTrxFieI4stdpqyrvzoYAFUgcChfL3tXO7Hw%2B%0AMgOdNngvFLAlW7dYYQOS%2BazUjVOtZcsNU4CmKu%2BMdh3L%2FY%2Fn2DmyrTZKIE16vucF8yCgSeuUEuZA%0ARXq869H12amZ3s6ulXYtUn3SXElq8VdZciW5kLjvA0ih7%2FeJFDuXYljXLhaJSRfgBNdFzdMkjGM2%0A%2BD%2Btf%2FP1RteHDlo6Ojv%2Fh%2FPFIkrImQAYvZvSCyQwhUN4GalRlEejpSvHfN8gyMp2jTjcEqzzE2dx%0ASHqFsHDTgIIW10%2Brc6llUcZhmrZXlbwkwc%2BPOa38leYPO0bZKKlRNCOZTe5v8nzIhzdpzcgj%0A&c=64964c1a0ba0cf98bc7f69479a734199&offset=0%2C0&limit=1000%2C1000&dimensions=2&totals=0%2C0",
            },
        },
    },
    result: {
        executionResult: {
            data: [
                ["1221828444.21", "246"],
                ["1240493764.75", "224"],
                ["1774159524.28", null],
                [null, "70"],
                [null, null],
                ["582846654.5", "92"],
            ],
            paging: {
                count: [6, 2],
                offset: [0, 0],
                total: [6, 2],
            },
            headerItems: [
                [
                    [
                        {
                            attributeHeaderItem: {
                                name: "CompuSci",
                                uri: "elem_949_168279",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Educationly",
                                uri: "elem_949_168282",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Explorer",
                                uri: "elem_949_169655",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Grammar Plus",
                                uri: "elem_949_168284",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "PhoenixSoft",
                                uri: "elem_949_964771",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "WonderKid",
                                uri: "elem_949_965523",
                            },
                        },
                    ],
                ],
                [
                    [
                        {
                            measureHeaderItem: {
                                name: "Sum of Amount",
                                order: 0,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "# of Open Opps.",
                                order: 1,
                            },
                        },
                    ],
                ],
            ],
        },
    },
} as unknown as ILocalExecutionRecording;
