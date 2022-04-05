// (C) 2007-2022 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import range from "lodash/range";
import cloneDeep from "lodash/cloneDeep";

import { ExperimentalExecutionsModule } from "../experimental-executions";
import { AttributesMapLoaderModule } from "../../utils/attributesMapLoader";
import { XhrModule } from "../../xhr";
import { MetadataModule } from "../../metadata";
import { IMetricDefinition } from "../../interfaces";
import { pretty } from "js-object-pretty-print";
import first from "lodash/first";
import sortBy from "lodash/sortBy";
import levenshtein from "fast-levenshtein";
import includes from "lodash/includes";
import find from "lodash/find";
import { mockLocalStorageModule } from "../../tests/mockLocalStorageModule";

interface IReportDefinition {
    columns: string[];
    definitions: IMetricDefinition[];
}

function fail(message: string) {
    throw new Error(message);
}

function missingMetricDefinition(
    metricDefinition: IMetricDefinition,
    closestMetricDefinition: IMetricDefinition,
) {
    const title = metricDefinition.title;

    fail(
        `Metric definition (${title}) was not found:
        ${pretty(metricDefinition)}, mismatch of ${pretty(closestMetricDefinition)}?`,
    );
}

function missingColumn(column: string, closest: string) {
    fail(`Column not found '${column}', mismatch of ${closest}?`);
}

function getClosestMatch(candidates: any[], getDistance: (candidate: any) => number) {
    const table = candidates.map((candidate) => {
        const distance = getDistance(candidate);

        return { distance, candidate };
    });

    const closestMatch = first(sortBy(table, (row) => row.distance));

    return closestMatch?.candidate;
}

function getClosestColumn(column: string, candidates: any[]) {
    return getClosestMatch(candidates, (candidate) => {
        return levenshtein.get(column, candidate);
    });
}

function getClosestMetricDefinition(definition: IMetricDefinition, candidates: IMetricDefinition[]) {
    return getClosestMatch(candidates, (candidate) => {
        return Object.keys(candidate).reduce((sum, prop: string) => {
            const definitionString: string = definition[prop] || "";
            return sum + levenshtein.get(definitionString, candidate[prop]);
        }, 0);
    });
}

function expectColumns(expected: string[], reportDefinition: IReportDefinition) {
    const actualColumns = reportDefinition.columns;

    expected.forEach((expectedColumn: any) => {
        if (!includes(actualColumns, expectedColumn)) {
            missingColumn(expectedColumn, getClosestColumn(expectedColumn, actualColumns));
        }
    });

    expect(expected).toEqual(actualColumns);
}

function expectMetricDefinition(expected: IMetricDefinition, reportDefinition: IReportDefinition) {
    const actualMetricDefinitions: IMetricDefinition[] = reportDefinition.definitions.map(
        (definition) => definition.metricDefinition as any,
    );

    const defFound = find(actualMetricDefinitions, expected);

    if (!defFound) {
        missingMetricDefinition(expected, getClosestMetricDefinition(expected, actualMetricDefinitions));
    }
}

function createExecution() {
    const xhr = new XhrModule(fetch, {}, mockLocalStorageModule);

    const loaderModule = new AttributesMapLoaderModule(new MetadataModule(xhr));
    return new ExperimentalExecutionsModule(xhr, loaderModule.loadAttributesMap.bind(loaderModule));
}

const mdEndpoint = "/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj";

describe("execution", () => {
    describe("with fake server", () => {
        let serverResponseMock: any;

        afterEach(() => {
            fetchMock.restore();
        });

        describe("Data Execution:", () => {
            beforeEach(() => {
                serverResponseMock = {
                    executionResult: {
                        columns: [
                            {
                                attributeDisplayForm: {
                                    meta: {
                                        identifier: "attrId",
                                        uri: "attrUri",
                                        title: "Df Title",
                                    },
                                },
                            },
                            {
                                metric: {
                                    meta: {
                                        identifier: "metricId",
                                        uri: "metricUri",
                                        title: "Metric Title",
                                    },
                                    content: {
                                        format: "#00",
                                    },
                                },
                            },
                        ],
                        headers: [
                            {
                                id: "attrId",
                                title: "Atribute Title",
                                type: "attrLabel",
                                uri: "attrUri",
                            },
                            {
                                id: "metricId",
                                title: "Metric Title",
                                type: "metric",
                                uri: "metricUri",
                            },
                        ],
                        tabularDataResult:
                            "/gdc/internal/projects/myFakeProjectId/experimental/executions/23452345",
                        extendedTabularDataResult:
                            "/gdc/internal/projects/myFakeProjectId/experimental/executions/extendedResults/23452345",
                    },
                };
            });

            describe("getData", () => {
                it("should resolve with JSON with correct data including headers", () => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

                    fetchMock.mock("/gdc/internal/projects/myFakeProjectId/experimental/executions", {
                        status: 200,
                        body: JSON.stringify(responseMock),
                    });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        {
                            status: 201,
                            body: JSON.stringify({
                                extendedTabularDataResult: {
                                    values: [{ id: 1, name: "a" }, 1],
                                },
                            }),
                        },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"])
                        .then((result) => {
                            expect(result.headers[0].id).toBe("attrId");
                            expect(result.headers[0].uri).toBe("attrUri");
                            expect(result.headers[0].type).toBe("attrLabel");
                            expect(result.headers[0].title).toBe("Atribute Title");
                            expect(result.headers[1].id).toBe("metricId");
                            expect(result.headers[1].uri).toBe("metricUri");
                            expect(result.headers[1].type).toBe("metric");
                            expect(result.headers[1].title).toBe("Metric Title");
                            expect(result.rawData[0]).toEqual({ id: 1, name: "a" });
                            expect(result.rawData[1]).toBe(1);
                            expect(result.warnings).toEqual([]);
                        });
                });

                it("should resolve with JSON with correct warnings", () => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

                    fetchMock.mock("/gdc/internal/projects/myFakeProjectId/experimental/executions", {
                        status: 200,
                        body: JSON.stringify(responseMock),
                    });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        {
                            status: 201,
                            body: JSON.stringify({ extendedTabularDataResult: { warnings: [1, 2, 3] } }),
                        },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"])
                        .then((result) => {
                            expect(result.warnings).toEqual([1, 2, 3]);
                        });
                });

                it("should retrieve all the pages", () => {
                    const responseMock = JSON.parse(JSON.stringify(serverResponseMock));

                    fetchMock.mock("/gdc/internal/projects/myFakeProjectId/experimental/executions", {
                        status: 200,
                        body: JSON.stringify(responseMock),
                    });

                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/23452345/,
                        {
                            status: 201,
                            body: JSON.stringify({
                                extendedTabularDataResult: {
                                    paging: {
                                        offset: 0,
                                        count: 1,
                                        total: 2,
                                        next: "/gdc/internal/projects/myFakeProjectId/experimental/executions/extendedResults/2343434",
                                    },
                                    values: [[{ id: "1", name: "a" }, "2"]],
                                },
                            }),
                        },
                    );

                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/2343434/,
                        {
                            status: 201,
                            body: JSON.stringify({
                                extendedTabularDataResult: {
                                    paging: {
                                        offset: 1,
                                        count: 1,
                                        total: 2,
                                        next: null,
                                    },
                                    values: [[{ id: "2", name: "b" }, "3"]],
                                },
                            }),
                        },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"], {})
                        .then((result) => {
                            expect(result.rawData).toEqual([
                                [{ id: "1", name: "a" }, "2"],
                                [{ id: "2", name: "b" }, "3"],
                            ]);
                        });
                });

                it("should not fail if tabular data result is missing", () => {
                    fetchMock.mock("/gdc/internal/projects/myFakeProjectId/experimental/executions", {
                        status: 200,
                        body: JSON.stringify(serverResponseMock),
                    });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"])
                        .then((result) => {
                            expect(result.rawData).toEqual([]);
                            expect(result.isEmpty).toBe(true);
                        });
                });

                it("should reject when execution fails", () => {
                    fetchMock.mock("/gdc/internal/projects/myFakeProjectId/experimental/executions", 400);

                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"])
                        .catch((err) => {
                            expect(err).toBeInstanceOf(Error);
                            expect(err.response.status).toBe(400);
                        });
                });

                it("should reject with 400 when data result fails", () => {
                    fetchMock.mock("/gdc/internal/projects/myFakeProjectId/experimental/executions", {
                        status: 200,
                        body: JSON.stringify(serverResponseMock),
                    });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 400, body: JSON.stringify({ tabularDataResult: { values: ["a", 1] } }) },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", [{ type: "metric", uri: "/metric/uri" }])
                        .then(null, (err) => {
                            expect(err).toBeInstanceOf(Error);
                        });
                });

                it("should wrap response headers with metric mappings", () => {
                    fetchMock.mock("/gdc/internal/projects/myFakeProjectId/experimental/executions", {
                        status: 200,
                        body: JSON.stringify(serverResponseMock),
                    });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", [{ type: "metric", uri: "/metric/uri" }], {
                            metricMappings: [{ element: "metricUri", measureIndex: 0 }],
                        })
                        .then((result) => {
                            expect(result.headers[1]).toEqual({
                                id: "metricId",
                                title: "Metric Title",
                                type: "metric",
                                uri: "metricUri",
                                measureIndex: 0,
                                isPoP: undefined,
                            });
                        })
                        .catch(() => {
                            throw new Error("Should not fail when processing mappings");
                        });
                });

                it("should set headers via settings", () => {
                    const matcher = "/gdc/internal/projects/myFakeProjectId/experimental/executions";
                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 },
                    );

                    return createExecution()
                        .getData(
                            "myFakeProjectId",
                            ["attrId", "metricId"],
                            {},
                            { headers: { "X-GDC-REQUEST": "foo" } },
                        )
                        .then(() => {
                            const request = fetchMock.lastCall(matcher)![1]!;
                            expect(
                                // type cast to narrow the type down to the one we know is used in this context
                                (request.headers as Record<string, string>)?.["X-GDC-REQUEST"] ?? "",
                            ).toEqual("foo");
                        });
                });
            });

            describe("getData with order", () => {
                it("should propagate orderBy to server call", () => {
                    const matcher = "/gdc/internal/projects/myFakeProjectId/experimental/executions";
                    const orderBy = [
                        {
                            column: "column1",
                            direction: "asc",
                        },
                        {
                            column: "column2",
                            direction: "desc",
                        },
                    ];

                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });

                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"], {
                            orderBy,
                        })
                        .then(() => {
                            const request = fetchMock.lastOptions(matcher) as RequestInit;
                            const requestBody = request.body && JSON.parse(request.body.toString());
                            expect(requestBody.execution.orderBy).toEqual(orderBy);
                        });
                });
            });

            describe("getData with definitions", () => {
                it("should propagate orderBy to server call", () => {
                    const matcher = "/gdc/internal/projects/myFakeProjectId/experimental/executions";
                    const definitions = [
                        {
                            metricDefinition: {
                                title: "Closed Pipeline - previous year",
                                expression: "SELECT (SELECT {adyRSiRTdnMD}) FOR PREVIOUS ({date.year})",
                                format: "#,,.00M",
                                identifier: "adyRSiRTdnMD.generated.pop.1fac4f897bbb5994a257cd2c9f0a81a4",
                            },
                        },
                    ];
                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });

                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 },
                    );

                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"], {
                            definitions,
                        })
                        .then(() => {
                            const request = fetchMock.lastOptions(matcher) as RequestInit;
                            const requestBody = request.body && JSON.parse(request.body.toString());
                            expect(requestBody.execution.definitions).toEqual(definitions);
                        });
                });
            });

            describe("getData with query language filters", () => {
                it("should propagate filters to the server call", () => {
                    // prepare filters and then use them with getData
                    const matcher = "/gdc/internal/projects/myFakeProjectId/experimental/executions";
                    fetchMock.mock(matcher, { status: 200, body: JSON.stringify(serverResponseMock) });
                    fetchMock.mock(
                        /\/gdc\/internal\/projects\/myFakeProjectId\/experimental\/executions\/extendedResults\/(\w+)/,
                        { status: 204 },
                    );
                    const where = {
                        "label.attr.city": { $eq: 1 },
                    };
                    return createExecution()
                        .getData("myFakeProjectId", ["attrId", "metricId"], {
                            where,
                        })
                        .then(() => {
                            const request = fetchMock.lastOptions(matcher) as RequestInit;
                            const requestBody = request.body && JSON.parse(request.body.toString());

                            expect(requestBody.execution.where).toEqual(where);
                        });
                });
            });
        });

        // used now only from Catalogue for getting right items/dateDataSets
        describe("MD object to execution definitions and columns", () => {
            let mdObj: any;
            beforeEach(() => {
                mdObj = {
                    visualizationClass: {
                        uri: "xyz",
                    },
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "m1",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: mdEndpoint + "/1144",
                                                },
                                                aggregation: "sum",
                                                filters: [
                                                    {
                                                        positiveAttributeFilter: {
                                                            displayForm: {
                                                                uri: mdEndpoint + "/952",
                                                            },
                                                            in: [
                                                                mdEndpoint + "/949/elements?id=168284",
                                                                mdEndpoint + "/949/elements?id=168282",
                                                            ],
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        title: "Sum of Amount",
                                        format: "#,##0.00",
                                    },
                                },
                                {
                                    measure: {
                                        localIdentifier: "m2",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: mdEndpoint + "/1244",
                                                },
                                                aggregation: "count",
                                            },
                                        },
                                        title: "Count of Activity",
                                        format: "#,##0.00",
                                    },
                                },
                                {
                                    measure: {
                                        localIdentifier: "m3",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: mdEndpoint + "/1556",
                                                },
                                            },
                                        },
                                        title: "Probability BOP",
                                        format: "#,##0.00",
                                    },
                                },
                                {
                                    measure: {
                                        localIdentifier: "m4",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: mdEndpoint + "/2825",
                                                },
                                                filters: [
                                                    {
                                                        positiveAttributeFilter: {
                                                            displayForm: {
                                                                uri: mdEndpoint + "/970",
                                                            },
                                                            in: [
                                                                mdEndpoint + "/969/elements?id=961042",
                                                                mdEndpoint + "/969/elements?id=961038",
                                                                mdEndpoint + "/969/elements?id=958079",
                                                                mdEndpoint + "/969/elements?id=961044",
                                                                mdEndpoint + "/969/elements?id=961046",
                                                            ],
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        title: "# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)",
                                        format: "#,##0",
                                    },
                                },
                            ],
                        },
                        {
                            localIdentifier: "attribute",
                            items: [
                                {
                                    visualizationAttribute: {
                                        localIdentifier: "a1",
                                        displayForm: {
                                            uri: mdEndpoint + "/1028",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    filters: [
                        {
                            positiveAttributeFilter: {
                                displayForm: {
                                    uri: mdEndpoint + "/1028",
                                },
                                in: [
                                    mdEndpoint + "/1025/elements?id=1243",
                                    mdEndpoint + "/1025/elements?id=1242",
                                    mdEndpoint + "/1025/elements?id=1241",
                                    mdEndpoint + "/1025/elements?id=1240",
                                    mdEndpoint + "/1025/elements?id=1239",
                                    mdEndpoint + "/1025/elements?id=1238",
                                    mdEndpoint + "/1025/elements?id=1236",
                                ],
                            },
                        },
                        {
                            relativeDateFilter: {
                                dataSet: {
                                    uri: mdEndpoint + "/16561",
                                },
                                granularity: "GDC.time.week",
                                from: -3,
                                to: 0,
                            },
                        },
                    ],
                    properties: {
                        sortItems: [
                            {
                                measureSortItem: {
                                    direction: "desc",
                                    locators: [
                                        {
                                            measureLocatorItem: {
                                                measureIdentifier: "m1",
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                attributeSortItem: {
                                    direction: "asc",
                                    attributeIdentifier: "a1",
                                },
                            },
                        ],
                    },
                };

                const displayForms = [
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: mdEndpoint + "/1025",
                            },
                            meta: {
                                uri: mdEndpoint + "/1028",
                            },
                        },
                    },
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: mdEndpoint + "/949",
                            },
                            meta: {
                                uri: mdEndpoint + "/952",
                            },
                        },
                    },
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: mdEndpoint + "/969",
                            },
                            meta: {
                                uri: mdEndpoint + "/970",
                            },
                        },
                    },
                ];
                const attributeObjects = [
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: mdEndpoint + "/1025",
                            },
                        },
                    },
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: mdEndpoint + "/949",
                            },
                        },
                    },
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: mdEndpoint + "/969",
                            },
                        },
                    },
                ];
                let callCount = 0;
                const twoCallsMatcher = () => {
                    if (callCount === 0) {
                        callCount = 1;
                        return {
                            status: 200,
                            body: JSON.stringify({
                                objects: {
                                    items: displayForms,
                                },
                            }),
                        };
                    }

                    return {
                        status: 200,
                        body: JSON.stringify({
                            objects: {
                                items: attributeObjects,
                            },
                        }),
                    };
                };
                fetchMock.mock(mdEndpoint + "ects/get", twoCallsMatcher);
            });

            it("creates proper configuration for execution", () => {
                return createExecution()
                    .mdToExecutionDefinitionsAndColumns("qamfsd9cw85e53mcqs74k8a0mwbf5gc2", mdObj)
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1025",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.b9f95d95adbeac03870b764f8b2c3402_filtered_sum",
                                "attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count",
                                mdEndpoint + "/1556",
                                "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.b9f95d95adbeac03870b764f8b2c3402_filtered_sum",
                                expression:
                                    "SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144]) " +
                                    "WHERE [" +
                                    mdEndpoint +
                                    "/949] " +
                                    "IN ([" +
                                    mdEndpoint +
                                    "/949/elements?id=168284]," +
                                    "[" +
                                    mdEndpoint +
                                    "/949/elements?id=168282])",
                                title: "Sum of Amount",
                                format: "#,##0.00",
                            },
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count",
                                expression: "SELECT COUNT([" + mdEndpoint + "/1244])",
                                title: "Count of Activity",
                                format: "#,##0.00",
                            },
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base",
                                expression:
                                    "SELECT [" +
                                    mdEndpoint +
                                    "/2825] " +
                                    "WHERE [" +
                                    mdEndpoint +
                                    "/969] " +
                                    "IN ([" +
                                    mdEndpoint +
                                    "/969/elements?id=961042]," +
                                    "[" +
                                    mdEndpoint +
                                    "/969/elements?id=961038]," +
                                    "[" +
                                    mdEndpoint +
                                    "/969/elements?id=958079]," +
                                    "[" +
                                    mdEndpoint +
                                    "/969/elements?id=961044]," +
                                    "[" +
                                    mdEndpoint +
                                    "/969/elements?id=961046])",
                                title: "# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)",
                                format: "#,##0",
                            },
                            execConfig,
                        );
                    });
            });

            it("handles empty filters", () => {
                const mdObjWithoutFilters = cloneDeep(mdObj);
                mdObjWithoutFilters.buckets[0].items[0].measure.definition.measureDefinition.filters[0].positiveAttributeFilter.in =
                    [];
                return createExecution()
                    .mdToExecutionDefinitionsAndColumns(
                        "qamfsd9cw85e53mcqs74k8a0mwbf5gc2",
                        mdObjWithoutFilters,
                    )
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1025",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum",
                                "attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count",
                                mdEndpoint + "/1556",
                                "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum",
                                expression: "SELECT SUM([" + mdEndpoint + "/1144])",
                                title: "Sum of Amount",
                                format: "#,##0.00",
                            },
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "attribute_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1244.generated.a865b88e507b9390e2175b79e1d6252f_count",
                                expression: "SELECT COUNT([" + mdEndpoint + "/1244])",
                                title: "Count of Activity",
                                format: "#,##0.00",
                            },
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.3812d81c1c1609700e47fc800e85bfac_filtered_base",
                                expression:
                                    "SELECT [" +
                                    mdEndpoint +
                                    "/2825] WHERE [" +
                                    mdEndpoint +
                                    "/969] IN ([" +
                                    mdEndpoint +
                                    "/969/elements?id=961042],[" +
                                    mdEndpoint +
                                    "/969/elements?id=961038],[" +
                                    mdEndpoint +
                                    "/969/elements?id=958079],[" +
                                    mdEndpoint +
                                    "/969/elements?id=961044],[" +
                                    mdEndpoint +
                                    "/969/elements?id=961046])",
                                title: "# of Opportunities (Account: 1 Source Consulting, 1-800 Postcards, 1-800 We Answer, 1-888-OhioComp, 14 West)",
                                format: "#,##0",
                            },
                            execConfig,
                        );
                    });
            });

            it("ensures measure title length does not exceed 1000 chars", () => {
                const mdObjCloned = cloneDeep(mdObj);
                mdObjCloned.buckets[0] = {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: mdEndpoint + "/1144",
                                        },
                                        aggregation: "sum",
                                        computeRatio: true,
                                    },
                                },
                                title: `Sum of Amount (${range(0, 1050).map(() => "element")})`,
                                format: "#,##0.00",
                            },
                        },
                    ],
                };

                return createExecution()
                    .mdToExecutionDefinitionsAndColumns("qamfsd9cw85e53mcqs74k8a0mwbf5gc2", mdObjCloned)
                    .then((execConfig: any) => {
                        execConfig.definitions.forEach((definition: any) => {
                            expect(definition.metricDefinition.title).toHaveLength(1000);
                        });
                    });
            });
        });

        describe("generating contribution metric", () => {
            let mdObjContribution: any;
            beforeEach(() => {
                mdObjContribution = {
                    visualizationClass: {
                        uri: "xyz",
                    },
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "m1",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: mdEndpoint + "/2825",
                                                },
                                                computeRatio: true,
                                            },
                                        },
                                        title: "% # of Opportunities",
                                        format: "#,##0",
                                    },
                                },
                            ],
                        },
                        {
                            localIdentifier: "attribute",
                            items: [
                                {
                                    visualizationAttribute: {
                                        localIdentifier: "a1",
                                        displayForm: {
                                            uri: mdEndpoint + "/1028",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                };

                const displayForms = [
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: mdEndpoint + "/1027",
                            },
                            meta: {
                                uri: mdEndpoint + "/1028",
                            },
                        },
                    },
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: mdEndpoint + "/42",
                            },
                            meta: {
                                uri: mdEndpoint + "/43",
                            },
                        },
                    },
                ];
                const attributeObjects = [
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: mdEndpoint + "/1027",
                            },
                        },
                    },
                    {
                        attribute: {
                            content: {},
                            meta: {
                                uri: mdEndpoint + "/42",
                            },
                        },
                    },
                ];
                let callCount = 0;
                const twoCallsMatcher = () => {
                    if (callCount === 0) {
                        callCount = 1;
                        return {
                            status: 200,
                            body: JSON.stringify({
                                objects: {
                                    items: displayForms,
                                },
                            }),
                        };
                    }

                    return {
                        status: 200,
                        body: JSON.stringify({
                            objects: {
                                items: attributeObjects,
                            },
                        }),
                    };
                };
                fetchMock.mock(mdEndpoint + "ects/get", twoCallsMatcher);
            });

            afterEach(() => {
                fetchMock.restore();
            });

            it("for calculated measure", () => {
                return createExecution()
                    .mdToExecutionDefinitionsAndColumns("qamfsd9cw85e53mcqs74k8a0mwbf5gc2", mdObjContribution)
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1027",
                                "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0eb685df0742b4e27091746615e06193_percent",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                title: "% # of Opportunities",
                                identifier:
                                    "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0eb685df0742b4e27091746615e06193_percent",
                                expression:
                                    "SELECT (SELECT [" +
                                    mdEndpoint +
                                    "/2825]) / (SELECT [" +
                                    mdEndpoint +
                                    "/2825] BY ALL [" +
                                    mdEndpoint +
                                    "/1027])",
                                format: "#,##0.00%",
                            },
                            execConfig,
                        );
                    });
            });

            it("for generated measure", () => {
                const mdObjContributionCloned = cloneDeep(mdObjContribution);
                mdObjContributionCloned.buckets[0] = {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: mdEndpoint + "/1144",
                                        },
                                        computeRatio: true,
                                        aggregation: "sum",
                                    },
                                },
                                title: "% Sum of Amount",
                                format: "#,##0.00",
                            },
                        },
                    ],
                };

                return createExecution()
                    .mdToExecutionDefinitionsAndColumns(
                        "qamfsd9cw85e53mcqs74k8a0mwbf5gc2",
                        mdObjContributionCloned,
                    )
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1027",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.3124707f49557fe26b7eecfa3f61b021_percent",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                title: "% Sum of Amount",
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.3124707f49557fe26b7eecfa3f61b021_percent",
                                expression:
                                    "SELECT (SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144])) / (SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144]) BY ALL [" +
                                    mdEndpoint +
                                    "/1027])",
                                format: "#,##0.00%",
                            },
                            execConfig,
                        );
                    });
            });

            it("for generated measure with attribute filters", () => {
                const mdObjContributionCloned = cloneDeep(mdObjContribution);
                mdObjContributionCloned.buckets[0] = {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: mdEndpoint + "/1",
                                        },
                                        computeRatio: true,
                                        aggregation: "sum",
                                        filters: [
                                            {
                                                positiveAttributeFilter: {
                                                    displayForm: {
                                                        uri: mdEndpoint + "/43",
                                                    },
                                                    in: [mdEndpoint + "/42/elements?id=61527"],
                                                },
                                            },
                                        ],
                                    },
                                },
                                title: "% Sum of Amount",
                                format: "#,##0.00",
                            },
                        },
                    ],
                };

                return createExecution()
                    .mdToExecutionDefinitionsAndColumns(
                        "qamfsd9cw85e53mcqs74k8a0mwbf5gc2",
                        mdObjContributionCloned,
                    )
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1027",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1.generated.08fe4920a4353ed70cdb0cb255489611_filtered_percent",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                title: "% Sum of Amount",
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1.generated.08fe4920a4353ed70cdb0cb255489611_filtered_percent",
                                expression:
                                    "SELECT (" +
                                    "SELECT SUM([" +
                                    mdEndpoint +
                                    "/1]) " +
                                    "WHERE [" +
                                    mdEndpoint +
                                    "/42] " +
                                    "IN ([" +
                                    mdEndpoint +
                                    "/42/elements?id=61527])" +
                                    ") / (" +
                                    "SELECT SUM([" +
                                    mdEndpoint +
                                    "/1]) " +
                                    "BY ALL [" +
                                    mdEndpoint +
                                    "/1027] " +
                                    "WHERE [" +
                                    mdEndpoint +
                                    "/42] " +
                                    "IN ([" +
                                    mdEndpoint +
                                    "/42/elements?id=61527])" +
                                    ")",
                                format: "#,##0.00%",
                            },
                            execConfig,
                        );
                    });
            });

            it("for generated measure with attribute filters without BY ALL expression", () => {
                const mdObjContributionCloned = cloneDeep(mdObjContribution);
                mdObjContributionCloned.buckets[0] = {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: mdEndpoint + "/1",
                                        },
                                        computeRatio: true,
                                        aggregation: "sum",
                                        filters: [
                                            {
                                                positiveAttributeFilter: {
                                                    displayForm: {
                                                        uri: mdEndpoint + "/43",
                                                    },
                                                    in: [mdEndpoint + "/42/elements?id=61527"],
                                                },
                                            },
                                        ],
                                    },
                                },
                                title: "% Sum of Amount",
                                format: "#,##0.00",
                            },
                        },
                    ],
                };
                const missingAttr = "/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1029";
                mdObjContributionCloned.buckets[1].items[0].visualizationAttribute.displayForm.uri =
                    missingAttr;

                return createExecution()
                    .mdToExecutionDefinitionsAndColumns(
                        "qamfsd9cw85e53mcqs74k8a0mwbf5gc2",
                        mdObjContributionCloned,
                    )
                    .then((execConfig: any) => {
                        expectMetricDefinition(
                            {
                                title: "% Sum of Amount",
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1.generated.e37e27d5a6d61fe71d56d7ae7a7655ac_filtered_percent",
                                expression:
                                    "SELECT (" +
                                    "SELECT SUM([" +
                                    mdEndpoint +
                                    "/1]) " +
                                    "WHERE [" +
                                    mdEndpoint +
                                    "/42] " +
                                    "IN ([" +
                                    mdEndpoint +
                                    "/42/elements?id=61527])" +
                                    ") / (" +
                                    "SELECT SUM([" +
                                    mdEndpoint +
                                    "/1]) " +
                                    "WHERE [" +
                                    mdEndpoint +
                                    "/42] " +
                                    "IN ([" +
                                    mdEndpoint +
                                    "/42/elements?id=61527])" +
                                    ")",
                                format: "#,##0.00%",
                            },
                            execConfig,
                        );
                    });
            });
        });

        describe("generating pop metric", () => {
            let mdObj: any;
            beforeEach(() => {
                mdObj = {
                    visualizationClass: {
                        uri: "xyz",
                    },
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "m1_pop",
                                        definition: {
                                            popMeasureDefinition: {
                                                measureIdentifier: "m1",
                                                popAttribute: {
                                                    uri: mdEndpoint + "/1233",
                                                },
                                            },
                                        },
                                        title: "# of Opportunities - previous year",
                                        format: "#,##0",
                                    },
                                },
                                {
                                    measure: {
                                        localIdentifier: "m1",
                                        definition: {
                                            measureDefinition: {
                                                item: {
                                                    uri: mdEndpoint + "/2825",
                                                },
                                            },
                                        },
                                        title: "# of Opportunities",
                                        format: "#,##0",
                                    },
                                },
                            ],
                        },
                        {
                            localIdentifier: "attribute",
                            items: [
                                {
                                    visualizationAttribute: {
                                        localIdentifier: "a1",
                                        displayForm: {
                                            uri: mdEndpoint + "/1234",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                };

                const displayForms = [
                    {
                        attributeDisplayForm: {
                            content: {
                                formOf: mdEndpoint + "/1233",
                            },
                            meta: {
                                uri: mdEndpoint + "/1234",
                            },
                        },
                    },
                ];
                const attributeObjects = [
                    {
                        attribute: {
                            content: {
                                type: "GDC.time.year",
                            },
                            meta: {
                                uri: mdEndpoint + "/1233",
                            },
                        },
                    },
                ];
                let callCount = 0;
                const twoCallsMatcher = () => {
                    if (callCount === 0) {
                        callCount = 1;
                        return {
                            status: 200,
                            body: JSON.stringify({
                                objects: {
                                    items: displayForms,
                                },
                            }),
                        };
                    }

                    return {
                        status: 200,
                        body: JSON.stringify({
                            objects: {
                                items: attributeObjects,
                            },
                        }),
                    };
                };
                fetchMock.mock(mdEndpoint + "ects/get", twoCallsMatcher);
            });

            it("for calculated metric", () => {
                return createExecution()
                    .mdToExecutionDefinitionsAndColumns("qamfsd9cw85e53mcqs74k8a0mwbf5gc2", mdObj)
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1233",
                                "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0e380388838e2d867a3d11ea64e22573_pop",
                                mdEndpoint + "/2825",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                title: "# of Opportunities - previous year",
                                identifier:
                                    "metric_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_2825.generated.0e380388838e2d867a3d11ea64e22573_pop",
                                expression:
                                    "SELECT [" +
                                    mdEndpoint +
                                    "/2825] FOR PREVIOUS ([" +
                                    mdEndpoint +
                                    "/1233])",
                                format: "#,##0",
                            },
                            execConfig,
                        );
                    });
            });

            it("for generated measure", () => {
                const mdObjCloned = cloneDeep(mdObj);
                mdObjCloned.buckets[0] = {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1_pop",
                                definition: {
                                    popMeasureDefinition: {
                                        measureIdentifier: "m1",
                                        popAttribute: {
                                            uri: mdEndpoint + "/1233",
                                        },
                                    },
                                },
                                title: "Sum of Amount - previous year",
                                format: "#,##0.00",
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: mdEndpoint + "/1144",
                                        },
                                        aggregation: "sum",
                                    },
                                },
                                title: "Sum of Amount",
                                format: "#,##0.00",
                            },
                        },
                    ],
                };

                return createExecution()
                    .mdToExecutionDefinitionsAndColumns("qamfsd9cw85e53mcqs74k8a0mwbf5gc2", mdObjCloned)
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1233",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.00d7d51e0e86780bebfe65b025ed8f14_pop",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.00d7d51e0e86780bebfe65b025ed8f14_pop",
                                expression:
                                    "SELECT (SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144])) FOR PREVIOUS ([" +
                                    mdEndpoint +
                                    "/1233])",
                                title: "Sum of Amount - previous year",
                                format: "#,##0.00",
                            },
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.7537800b1daf7582198e84ca6205d600_sum",
                                expression: "SELECT SUM([" + mdEndpoint + "/1144])",
                                title: "Sum of Amount",
                                format: "#,##0.00",
                            },
                            execConfig,
                        );
                    });
            });

            it("for generated measure with contribution", () => {
                const mdObjCloned = cloneDeep(mdObj);
                mdObjCloned.buckets[0] = {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1_pop",
                                definition: {
                                    popMeasureDefinition: {
                                        measureIdentifier: "m1",
                                        popAttribute: {
                                            uri: mdEndpoint + "/1233",
                                        },
                                    },
                                },
                                title: "% Sum of Amount - previous year",
                                format: "#,##0.00",
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: mdEndpoint + "/1144",
                                        },
                                        aggregation: "sum",
                                        computeRatio: true,
                                    },
                                },
                                title: "% Sum of Amount",
                                format: "#,##0.00",
                            },
                        },
                    ],
                };

                return createExecution()
                    .mdToExecutionDefinitionsAndColumns("qamfsd9cw85e53mcqs74k8a0mwbf5gc2", mdObjCloned)
                    .then((execConfig: any) => {
                        expectColumns(
                            [
                                mdEndpoint + "/1233",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.985ea06c284684b6feb0b05a6d796034_pop",
                                "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.93434aa1d9e8d4fe653757ba8c891025_percent",
                            ],
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                title: "% Sum of Amount - previous year",
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.985ea06c284684b6feb0b05a6d796034_pop",
                                expression:
                                    "SELECT (SELECT (SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144])) / (SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144]) BY ALL [" +
                                    mdEndpoint +
                                    "/1233])) FOR PREVIOUS ([" +
                                    mdEndpoint +
                                    "/1233])",
                                format: "#,##0.00%",
                            },
                            execConfig,
                        );

                        expectMetricDefinition(
                            {
                                title: "% Sum of Amount",
                                identifier:
                                    "fact_qamfsd9cw85e53mcqs74k8a0mwbf5gc2_1144.generated.93434aa1d9e8d4fe653757ba8c891025_percent",
                                expression:
                                    "SELECT (SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144])) / (SELECT SUM([" +
                                    mdEndpoint +
                                    "/1144]) BY ALL [" +
                                    mdEndpoint +
                                    "/1233])",
                                format: "#,##0.00%",
                            },
                            execConfig,
                        );
                    });
            });
        });
    });
});
