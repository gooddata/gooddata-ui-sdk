// (C) 2007-2026 GoodData Corporation

export const BarChartWithPreviousPeriodMeasure = {
    definition: {
        workspace: "testWorkspace",
        buckets: [],
        attributes: [
            {
                attribute: {
                    displayForm: {
                        uri: "obj_324",
                    },
                    localIdentifier: "a1",
                },
            },
        ],
        measures: [
            {
                measure: {
                    alias: "Primary measure - period ago",
                    localIdentifier: "m1.pp1",
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m1",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "obj_330",
                                    },
                                    periodsAgo: 1,
                                },
                            ],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "m1",
                    alias: "Primary measure",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1279",
                            },
                            filters: [
                                {
                                    positiveAttributeFilter: {
                                        displayForm: {
                                            uri: "obj_970",
                                        },
                                        in: {
                                            values: ["elem_969_958077"],
                                        },
                                    },
                                },
                            ],
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
                itemIdentifiers: ["a1"],
            },
        ],
        filters: [
            {
                absoluteDateFilter: {
                    dataSet: {
                        uri: "obj_330",
                    },
                    from: "2011-01-01",
                    to: "2011-12-31",
                },
            },
        ],
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
                                            name: "Primary measure - period ago",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1.pp1",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1",
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
                                name: "Year created",
                                localIdentifier: "a1",
                                uri: "obj_324",
                                identifier: "closed.aag81lMifn6q",
                                formOf: {
                                    name: "Year created",
                                    uri: "obj_323",
                                    identifier: "closed.year",
                                },
                            },
                        },
                    ],
                },
            ],
            links: {
                executionResult:
                    "/gdc/app/projects/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/executionResults/8815266349284326400?q=eAGlkdFPwjAQxv%2BVpfigyXSDMUASY4yI4cUYlQez7KHQmylr1%2BbaQXDhf7d1mGDiC%2FjWXu5%2B9933%0ANQRBK7RPVAIZk3lluRXASEiWStSyMmScNYRxowXdThXKGXNt0QdbRpJFfFAOTNk3nxUU625ZxEVP%0AmOGqGFmZckYHkVqsoqTXd7gFNfAgQEJl5y%2Bz4xlJBO20ueXsxgGptcgXtYVTFCUOwJALMVGb6tWC%0AvvuhTabHauul145mnIluUpf%2BXUtJceu%2B70DxUOubd3dfD87vhTLALlzDt%2Bt%2F1ZWlwmeQ5WGW57s8%0AJBLc3cs2l8IFQv3as07Y6cRXcfxr%2BwH4GbmXFEigpkYILgONsOaqNoEG5Mon3pKPt3OYjoYJ2YUN%0AOVnPP7d3iXcG1cbbsr%2FjEVWtSb77AnuB8r0%3D%0A&c=8b2a2cb0917fb346c0a3970046b85b4c&offset=0%2C0&limit=1000%2C1000&dimensions=2&totals=0%2C0",
            },
        },
    },
    result: {
        executionResult: {
            data: [
                ["24000", null],
                [null, "7200"],
            ],
            paging: {
                count: [2, 2],
                offset: [0, 0],
                total: [2, 2],
            },
            headerItems: [
                [
                    [
                        {
                            measureHeaderItem: {
                                name: "Primary measure - period ago",
                                order: 0,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure",
                                order: 1,
                            },
                        },
                    ],
                ],
                [
                    [
                        {
                            attributeHeaderItem: {
                                name: "2010",
                                uri: "elem_323_2010",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "2011",
                                uri: "elem_323_2011",
                            },
                        },
                    ],
                ],
            ],
        },
    },
};
