// (C) 2026 GoodData Corporation

export const ComboChartWithTwoMeasuresViewByAttributeNoBuckets = {
    definition: {
        workspace: "testWorkspace",
        buckets: [],
        attributes: [
            {
                attribute: {
                    displayForm: {
                        uri: "obj_158",
                    },
                    localIdentifier: "yearCreatedAttribute",
                },
            },
        ],
        measures: [
            {
                measure: {
                    localIdentifier: "lostMetric",
                    alias: "Lost",
                    format: "#,##0.00",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1283",
                            },
                            filters: [],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "wonMetric",
                    alias: "Won",
                    format: "#,##0.00",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1284",
                            },
                            filters: [],
                        },
                    },
                },
            },
        ],
        dimensions: [
            {
                itemIdentifiers: ["yearCreatedAttribute"],
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
                            measureGroupHeader: {
                                items: [
                                    {
                                        measureHeaderItem: {
                                            format: "#,##0.00",
                                            identifier: "af2Ewj9Re2vK",
                                            localIdentifier: "lostMetric",
                                            name: "<button>Lost</button> ...",
                                            uri: "obj_1283",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            format: "#,##0.00",
                                            identifier: "afSEwRwdbMeQ",
                                            localIdentifier: "wonMetric",
                                            name: "Won",
                                            uri: "obj_1284",
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
                                formOf: {
                                    identifier: "created",
                                    name: "Year created",
                                    uri: "obj_157",
                                },
                                identifier: "created.aag81lMifn6q",
                                localIdentifier: "yearCreatedAttribute",
                                name: "Year (Created)",
                                uri: "obj_158",
                            },
                        },
                    ],
                },
            ],
            links: {
                executionResult:
                    "/gdc/app/projects/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/executionResults/5065774892428557312?q=eAGlklFL5DAUhf9KyLy4MNg6zuDsgIisugjLsriKiMzDbXOnjaZJTW6pZeh%2F93Y66ii%2BOAN5SJqT%0Ak6%2FnZCk9ls7TXyhQzuSNJU0GlRzK1JmqsLdaUR7k7H4%2BlAttCP164V3dzWSB5HX627uqlKwJ7CVn%0Ay%2FXpj9p5yx7OF8AKmXn9fkunW0qlQ2mguWDJpWJJlKk0KlSkRjE2yWG9CPEzTkxsFiFV1tsmfzqg%0A8egpcslDdDCZMnQCAc8NFmjp5ury%2Bx5HEfanw4lWx2wIxL%2BXVITbEB2xgfLamDNX2%2F%2BE5emr29nF%0Ad9l%2BjtmsT1eWj928KgrwDfvcIfhN1OuuwvV3sffLIxCqH6xYdfvlhiMwXQlc82rMW%2B6yr7bv5q23%0AwXAwiPfj%2BAPBdY6CeYRbCDBGuLJ7UpXVpDEIyoEEeBSpcQGV4DSFdSRqZzeY%2FrhAvOzv3CLs0fRQ%0AtsPl%2BwPbATRxlL%2FSglWfSG9X3DuAjrcBRfsp1hp1lnOxAjLQNpAIBBmKf94lkGijqdlI9%2Fy5xJTF%0AuyU8ke28fQEDx2gq%0A&c=47a422fb552e888d8142930477df4090&dimension=Opportunities&dimension=Year%20(Created)",
            },
        },
    },
    result: {
        executionResult: {
            data: [
                ["1980676.11", "4460045.43", "13799517.23", "18664637.35", "3565695.04"],
                ["466158.62", "2233241.26", "12395325.24", "18957045.27", "4258983.06"],
            ],
            headerItems: [
                [],
                [
                    [
                        {
                            attributeHeaderItem: {
                                name: "<button>2008</button>",
                                uri: "elem_158_2008",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "2009",
                                uri: "elem_158_2009",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "2010",
                                uri: "elem_158_2010",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "2011",
                                uri: "elem_158_2011",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "2012",
                                uri: "elem_158_2012",
                            },
                        },
                    ],
                ],
            ],
            paging: {
                count: [3, 5],
                offset: [0, 0],
                total: [3, 5],
            },
        },
    },
};
