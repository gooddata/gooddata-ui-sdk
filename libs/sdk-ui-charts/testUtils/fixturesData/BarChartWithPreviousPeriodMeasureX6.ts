// (C) 2026 GoodData Corporation

export const BarChartWithPreviousPeriodMeasureX6 = {
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
                    alias: "Primary measure - period ago_1",
                    localIdentifier: "m1.pp1_1",
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m1_1",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "obj_330_1",
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
                    localIdentifier: "m1_1",
                    alias: "Primary measure_1",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1279_1",
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
            {
                measure: {
                    alias: "Primary measure - period ago_2",
                    localIdentifier: "m1.pp1_2",
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m1_2",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "obj_330_2",
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
                    localIdentifier: "m1_2",
                    alias: "Primary measure_2",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1279_2",
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
            {
                measure: {
                    alias: "Primary measure - period ago_3",
                    localIdentifier: "m1.pp1_3",
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m1_3",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "obj_330_3",
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
                    localIdentifier: "m1_3",
                    alias: "Primary measure_3",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1279_3",
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
            {
                measure: {
                    alias: "Primary measure - period ago_4",
                    localIdentifier: "m1.pp1_4",
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m1_4",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "obj_330_4",
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
                    localIdentifier: "m1_4",
                    alias: "Primary measure_4",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1279_4",
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
            {
                measure: {
                    alias: "Primary measure - period ago_5",
                    localIdentifier: "m1.pp1_5",
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m1_5",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "obj_330_5",
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
                    localIdentifier: "m1_5",
                    alias: "Primary measure_5",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1279_5",
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
            {
                measure: {
                    alias: "Primary measure - period ago_6",
                    localIdentifier: "m1.pp1_6",
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m1_6",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        uri: "obj_330_6",
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
                    localIdentifier: "m1_6",
                    alias: "Primary measure_6",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1279_6",
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
                                            name: "Primary measure - period ago_1",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1.pp1_1",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure_1",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1_1",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure - period ago_2",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1.pp1_2",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure_2",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1_2",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure - period ago_3",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1.pp1_3",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure_3",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1_3",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure - period ago_4",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1.pp1_4",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure_4",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1_4",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure - period ago_5",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1.pp1_5",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure_5",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1_5",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure - period ago_6",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1.pp1_6",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Primary measure_6",
                                            format: "$#,##0.00",
                                            localIdentifier: "m1_6",
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
                ["24000", null],
                [null, "7200"],
                ["24000", null],
                [null, "7200"],
                ["24000", null],
                [null, "7200"],
                ["24000", null],
                [null, "7200"],
                ["24000", null],
                [null, "7200"],
            ],
            paging: {
                count: [12, 2],
                offset: [0, 0],
                total: [12, 2],
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
                        {
                            measureHeaderItem: {
                                name: "Primary measure - period ago",
                                order: 2,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure",
                                order: 3,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure - period ago",
                                order: 4,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure",
                                order: 5,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure - period ago",
                                order: 6,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure",
                                order: 7,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure - period ago",
                                order: 8,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure",
                                order: 9,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure - period ago",
                                order: 10,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Primary measure",
                                order: 11,
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
