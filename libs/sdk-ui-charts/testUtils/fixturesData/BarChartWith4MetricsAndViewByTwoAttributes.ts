// (C) 2026 GoodData Corporation

export const BarChartWith4MetricsAndViewByTwoAttributes = {
    definition: {
        workspace: "testWorkspace",
        buckets: [],
        attributes: [
            {
                attribute: {
                    displayForm: {
                        uri: "obj_1027",
                    },
                    localIdentifier: "0e3388d37e444c369731afe398740572",
                },
            },
            {
                attribute: {
                    displayForm: {
                        uri: "obj_1024",
                    },
                    localIdentifier: "6af145960f4145efbe4ace7504b0f1de",
                },
            },
        ],
        measures: [
            {
                measure: {
                    localIdentifier: "c2fa878519934f39aefe9325638f2beb",
                    alias: "_Close [BOP]",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_9211",
                            },
                            filters: [],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "8a1a34106a8a41c8b0a8da816600802e",
                    alias: "_Close [EOP]",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_9203",
                            },
                            filters: [],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "3b4fc6113ff9452da677ef7842e2302c",
                    alias: "_Timeline [BOP]",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1277",
                            },
                            filters: [],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "26843260d95c4c9fa0aecc996ffd7829",
                    alias: "_Timeline [EOP]",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1276",
                            },
                            filters: [],
                        },
                    },
                },
            },
        ],
        dimensions: [
            {
                itemIdentifiers: ["measureGroup"],
            },
            {
                itemIdentifiers: ["0e3388d37e444c369731afe398740572", "6af145960f4145efbe4ace7504b0f1de"],
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
                            measureGroupHeader: {
                                items: [
                                    {
                                        measureHeaderItem: {
                                            name: "_Close [BOP]",
                                            format: "#,##0.00",
                                            localIdentifier: "c2fa878519934f39aefe9325638f2beb",
                                            uri: "obj_9211",
                                            identifier: "aaeb7jTCfexV",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "_Close [EOP]",
                                            format: "#,##0.00",
                                            localIdentifier: "8a1a34106a8a41c8b0a8da816600802e",
                                            uri: "obj_9203",
                                            identifier: "aazb6kroa3iC",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "_Timeline [BOP]",
                                            format: "#,##0.00",
                                            localIdentifier: "3b4fc6113ff9452da677ef7842e2302c",
                                            uri: "obj_1277",
                                            identifier: "aiTEuXhZaJw5",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "_Timeline [EOP]",
                                            format: "#,##0.00",
                                            localIdentifier: "26843260d95c4c9fa0aecc996ffd7829",
                                            uri: "obj_1276",
                                            identifier: "ahUEuUVTefyt",
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
                                localIdentifier: "0e3388d37e444c369731afe398740572",
                                uri: "obj_1027",
                                identifier: "label.owner.department",
                                formOf: {
                                    name: "Department",
                                    uri: "obj_1026",
                                    identifier: "attr.owner.department",
                                },
                            },
                        },
                        {
                            attributeHeader: {
                                name: "Region",
                                localIdentifier: "6af145960f4145efbe4ace7504b0f1de",
                                uri: "obj_1024",
                                identifier: "label.owner.region",
                                formOf: {
                                    name: "Region",
                                    uri: "obj_1023",
                                    identifier: "attr.owner.region",
                                },
                            },
                        },
                    ],
                },
            ],
            links: {
                executionResult:
                    "/gdc/app/projects/jroecoqa7jywstxy1hxp8lwl2c4nc10t/executionResults/2601650277422562816?q=eAGtUtFOwjAU%2FRVTXhfbDcKUxJioaHhRQ%2BBpWUxZr1jSrrPtMhbCv3snwgORBzaSvrS995x7zrkb%0AYqEw1r9yDWRE5rmXXoEgAcmMKnXuyCjZEO69lYvSw6z5xbonKLj1GnKPla7Umtsan%2FEipCsUr5%2BN%0A1ROBT3QpMqoFXVkDmfnm8aqunF%2FX4de6uFGVirJBnoXMU7NY0ZBFMWIsuIOxggZ%2BPp20ABlS2LW7%0AeynuEPFX1fHcB1WtBh02sMZz1ViUpMH%2BpNvgH8OmsJQmx5aLmjW4hFn9U2YdZu5mVP%2BkUWlANOBm%0AZbst%2B8Sd4R5T6gW9Hrtm7NiufYofj8o4uEoe3t5TrNlhnB%2FibRSGpEnrbOJxV2LWP5N4JjUomXcX%0AHUZx3Jq7o27kHpItpm5N1UT%2Bl9yLNWVB0u0POyWCAQ%3D%3D%0A&c=66407e2f85895dae317f0215f069b848&offset=0%2C0&limit=1000%2C1000&dimensions=2&totals=0%2C0",
            },
        },
    },
    result: {
        executionResult: {
            data: [
                ["40652", "41013", "40630", "40633"],
                ["42613", "41515", "41380", "42794"],
                ["36525", "36525", "36525", "36525"],
                ["44195", "44195", "44195", "44195"],
            ],
            paging: {
                count: [4, 4],
                offset: [0, 0],
                total: [4, 4],
            },
            headerItems: [
                [
                    [
                        {
                            measureHeaderItem: {
                                name: "_Close [BOP]",
                                order: 0,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "_Close [EOP]",
                                order: 1,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "_Timeline [BOP]",
                                order: 2,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "_Timeline [EOP]",
                                order: 3,
                            },
                        },
                    ],
                ],
                [
                    [
                        {
                            attributeHeaderItem: {
                                name: "Direct Sales",
                                uri: "elem_1026_1226",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Direct Sales",
                                uri: "elem_1026_1226",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Inside Sales",
                                uri: "elem_1026_1234",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Inside Sales",
                                uri: "elem_1026_1234",
                            },
                        },
                    ],
                    [
                        {
                            attributeHeaderItem: {
                                name: "East Coast",
                                uri: "elem_1023_1225",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "West Coast",
                                uri: "elem_1023_1237",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "East Coast",
                                uri: "elem_1023_1225",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "West Coast",
                                uri: "elem_1023_1237",
                            },
                        },
                    ],
                ],
            ],
        },
    },
};
