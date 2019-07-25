// (C) 2019 GoodData Corporation
import { VisualizationInput, AFM } from "@gooddata/typings";
import { getModelNotationFor } from "../objectToModelNotation";
import * as Model from "..";

/**
 * Makes sure that evaluating the model notation results in the provided object.
 * @param modelNotation
 * @param expected
 */
const testModelNotation = (modelNotation: string, expected: any) => {
    // tslint:disable-next-line: function-constructor We need this to perform the test and since this is in test code this should be OK.
    const f = new Function("Model", `return ${modelNotation}`);
    const actual = f(Model);
    expect(actual).toMatchObject(expected);
};

describe("getModelNotationFor", () => {
    describe("unknown objects", () => {
        it.each([
            [undefined, undefined],
            [null, null],
            [true, true],
            ["foo", '"foo"'],
            [42, 42],
            [[], "[]"],
            [{ foo: "bar" }, '{foo: "bar"}'],
        ])(`should not touch irrelevant input %p`, (value, expectedValue) => {
            expect(getModelNotationFor(value)).toEqual(expectedValue);
        });
    });
    describe("attributes", () => {
        it("should handle attribute with identifier", () => {
            const input: VisualizationInput.IAttribute = {
                visualizationAttribute: {
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle attribute with uri", () => {
            const input: VisualizationInput.IAttribute = {
                visualizationAttribute: {
                    displayForm: {
                        uri: "/gdc/md/PROJECT/obj/42",
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle attribute with alias", () => {
            const input: VisualizationInput.IAttribute = {
                visualizationAttribute: {
                    alias: "My Alias",
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("simple measures", () => {
        it("should handle basic measure", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with alias", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    alias: "Alias",
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with format", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    format: "###,## $",
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with title", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    title: "Title",
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with computeRatio: true", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            computeRatio: true,
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with aggregation", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            aggregation: "median",
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with a filter", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            filters: [
                                {
                                    positiveAttributeFilter: {
                                        displayForm: {
                                            identifier: "filter",
                                        },
                                        in: ["a", "b", "c"],
                                    },
                                },
                            ],
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("arithmetic measures", () => {
        it("should handle basic arithmetic measure", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: ["m_1", "m_2"],
                            operator: "ratio",
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("pop measures", () => {
        it("should handle basic pop measure", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        popMeasureDefinition: {
                            measureIdentifier: "m_1",
                            popAttribute: {
                                identifier: "pop",
                            },
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("previous period measures", () => {
        it("should handle basic previous period measure", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m_1",
                            dateDataSets: [
                                {
                                    dataSet: {
                                        identifier: "ds_1",
                                    },
                                    periodsAgo: 5,
                                },
                            ],
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic previous period measure without dataSets", () => {
            const input: VisualizationInput.IMeasure = {
                measure: {
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m_1",
                            dateDataSets: [],
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("sortBy", () => {
        it("should handle basic attribute sort item", () => {
            const input: AFM.IAttributeSortItem = {
                attributeSortItem: {
                    attributeIdentifier: "foo",
                    direction: "asc",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle attribute sort item with aggregation", () => {
            const input: AFM.IAttributeSortItem = {
                attributeSortItem: {
                    attributeIdentifier: "foo",
                    direction: "asc",
                    aggregation: "sum",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic measure sort item", () => {
            const input: AFM.IMeasureSortItem = {
                measureSortItem: {
                    direction: "asc",
                    locators: [
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m_1",
                            },
                        },
                    ],
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure sort item with attribute locators", () => {
            const input: AFM.IMeasureSortItem = {
                measureSortItem: {
                    direction: "asc",
                    locators: [
                        {
                            attributeLocatorItem: {
                                attributeIdentifier: "a_1",
                                element: "e_1",
                            },
                        },
                        {
                            measureLocatorItem: {
                                measureIdentifier: "m_1",
                            },
                        },
                    ],
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("filters", () => {
        it("should handle basic positive attribute filter", () => {
            const input: AFM.IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: ["a", "b", "c"],
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle textual positive attribute filter", () => {
            const input: AFM.IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: ["a", "b", "c"],
                    textFilter: true,
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic negative attribute filter", () => {
            const input: AFM.INegativeAttributeFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: ["a", "b", "c"],
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic absolute date filter", () => {
            const input: AFM.IAbsoluteDateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        identifier: "foo",
                    },
                    from: "2019-01-01",
                    to: "2019-12-31",
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic relative date filter", () => {
            const input: AFM.IRelativeDateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        identifier: "foo",
                    },
                    granularity: "GDC.time.year",
                    from: -42,
                    to: 42,
                },
            };
            const actual = getModelNotationFor(input);
            testModelNotation(actual, input);
        });
    });
});
