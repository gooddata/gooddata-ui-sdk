// (C) 2019-2022 GoodData Corporation
import { factoryNotationFor } from "../index.js";
import { IAttribute } from "../../attribute/index.js";
import { newAttribute } from "../../attribute/factory.js";
import {
    IAttributeSortItem,
    IMeasureSortItem,
    newAttributeAreaSort,
    newAttributeSort,
    newMeasureSort,
} from "../../base/sort.js";
import {
    IAbsoluteDateFilter,
    IMeasureValueFilter,
    INegativeAttributeFilter,
    IPositiveAttributeFilter,
    IRelativeDateFilter,
    IRankingFilter,
} from "../../filter/index.js";
import {
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    newMeasureValueFilter,
    newRankingFilter,
} from "../../filter/factory.js";
import { IMeasure } from "../../measure/index.js";
import {
    newArithmeticMeasure,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "../../measure/factory.js";
import { idRef, localIdRef, uriRef } from "../../../objRef/factory.js";
import { ITotal, newTotal } from "../../base/totals.js";

// object with all the factory functions to be DI'd into the testing function
const factories = {
    newAttribute,

    newMeasure,
    newArithmeticMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,

    newAbsoluteDateFilter,
    newRelativeDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newMeasureValueFilter,
    newRankingFilter,

    newAttributeSort,
    newAttributeAreaSort,
    newMeasureSort,

    newTotal,

    idRef,
    localIdRef,
    uriRef,
};

/**
 * Makes sure that evaluating the model notation results in the provided object.
 */
const testModelNotation = (factoryNotation: string, expected: any) => {
    // We need this to perform the test and since this is in test code this should be OK.
    const f = new Function(
        "factories",
        `const {${Object.keys(factories).join(",")}} = factories;  return ${factoryNotation}`,
    );
    const actual = f(factories);
    expect(actual).toMatchObject(expected);
};

describe("factoryNotationFor", () => {
    describe("attributes", () => {
        it("should handle attribute with identifier", () => {
            const input: IAttribute = {
                attribute: {
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle attribute with alias", () => {
            const input: IAttribute = {
                attribute: {
                    alias: "My Alias",
                    displayForm: {
                        identifier: "foo",
                    },
                    localIdentifier: "bar",
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("simple measures", () => {
        it("should handle basic measure", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with alias", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with format", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with multiline format (RAIL-4241)", () => {
            const input: IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    format: "[<0](#,##0.0);\n#,##0.0",
                    localIdentifier: "bar",
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with title", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with computeRatio: true", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with aggregation", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure with a filter", () => {
            const input: IMeasure = {
                measure: {
                    definition: {
                        measureDefinition: {
                            filters: [
                                {
                                    positiveAttributeFilter: {
                                        displayForm: {
                                            identifier: "filter",
                                        },
                                        in: { uris: ["a", "b", "c"] },
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("arithmetic measures", () => {
        it("should handle basic arithmetic measure", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("pop measures", () => {
        it("should handle basic pop measure", () => {
            const input: IMeasure = {
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
                    alias: "alias",
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("previous period measures", () => {
        it("should handle basic previous period measure", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic previous period measure without dataSets", () => {
            const input: IMeasure = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("sortBy", () => {
        it("should handle basic attribute sort item", () => {
            const input: IAttributeSortItem = {
                attributeSortItem: {
                    attributeIdentifier: "foo",
                    direction: "asc",
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle attribute area sort item", () => {
            const input: IAttributeSortItem = {
                attributeSortItem: {
                    attributeIdentifier: "foo",
                    direction: "asc",
                    aggregation: "sum",
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic measure sort item", () => {
            const input: IMeasureSortItem = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle measure sort item with attribute locators", () => {
            const input: IMeasureSortItem = {
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
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("filters", () => {
        it("should handle basic positive attribute filter", () => {
            const input: IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { uris: ["a", "b", "c"] },
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle textual positive attribute filter", () => {
            const input: IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    in: { values: ["a", "b", "c"] },
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic negative attribute filter", () => {
            const input: INegativeAttributeFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "foo",
                    },
                    notIn: { values: ["a", "b", "c"] },
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic absolute date filter", () => {
            const input: IAbsoluteDateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        identifier: "foo",
                    },
                    from: "2019-01-01",
                    to: "2019-12-31",
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle basic relative date filter", () => {
            const input: IRelativeDateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        identifier: "foo",
                    },
                    granularity: "GDC.time.year",
                    from: -42,
                    to: 42,
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
        it("should handle relative date filter with zeroes (RAIL-4234)", () => {
            const input: IRelativeDateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        identifier: "foo",
                    },
                    granularity: "GDC.time.year",
                    from: 0,
                    to: 0,
                },
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });

        describe("measure value filter", () => {
            it("should handle measure value filter with comparison", () => {
                const input: IMeasureValueFilter = {
                    measureValueFilter: {
                        measure: {
                            localIdentifier: "foo",
                        },
                        condition: {
                            comparison: {
                                operator: "EQUAL_TO",
                                value: 11,
                            },
                        },
                    },
                };

                const actual = factoryNotationFor(input);

                testModelNotation(actual, input);
            });

            it("should handle measure value filter with comparison and treat null values as", () => {
                const input: IMeasureValueFilter = {
                    measureValueFilter: {
                        measure: {
                            localIdentifier: "foo",
                        },
                        condition: {
                            comparison: {
                                operator: "EQUAL_TO",
                                value: 11,
                                treatNullValuesAs: 42,
                            },
                        },
                    },
                };

                const actual = factoryNotationFor(input);

                testModelNotation(actual, input);
            });

            it("should handle measure value filter with range and treat null values as", () => {
                const input: IMeasureValueFilter = {
                    measureValueFilter: {
                        measure: {
                            localIdentifier: "foo",
                        },
                        condition: {
                            range: {
                                operator: "BETWEEN",
                                from: 0,
                                to: 100,
                                treatNullValuesAs: 42,
                            },
                        },
                    },
                };

                const actual = factoryNotationFor(input);

                testModelNotation(actual, input);
            });
        });

        describe("ranking filter", () => {
            it("should handle ranking filter without attribute", () => {
                const input: IRankingFilter = {
                    rankingFilter: {
                        measure: {
                            localIdentifier: "m1",
                        },
                        operator: "BOTTOM",
                        value: 3,
                    },
                };
                const actual = factoryNotationFor(input);
                testModelNotation(actual, input);
            });
            it("should handle ranking filter with attributes", () => {
                const input: IRankingFilter = {
                    rankingFilter: {
                        measure: {
                            localIdentifier: "m1",
                        },
                        operator: "BOTTOM",
                        value: 3,
                        attributes: [{ localIdentifier: "a1" }, { localIdentifier: "a2" }],
                    },
                };
                const actual = factoryNotationFor(input);
                testModelNotation(actual, input);
            });
        });
    });
    describe("totals", () => {
        it("should handle total without alias", () => {
            const input: ITotal = {
                attributeIdentifier: "attr",
                measureIdentifier: "measure",
                type: "sum",
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });

        it("should handle total with alias", () => {
            const input: ITotal = {
                attributeIdentifier: "attr",
                measureIdentifier: "measure",
                type: "sum",
                alias: "some alias",
            };
            const actual = factoryNotationFor(input);
            testModelNotation(actual, input);
        });
    });
    describe("additional conversion", () => {
        const additionalConversion = (obj: any) => {
            if (typeof obj === "object" && "foo" in obj) {
                return `newFoo(${obj.foo})`;
            }
            return undefined;
        };

        it("should handle custom conversion", () => {
            const input = { foo: 42 };
            const actual = factoryNotationFor(input, additionalConversion);
            expect(actual).toEqual("newFoo(42)");
        });

        it("should handle nested custom conversion", () => {
            const input = { wrapped: { baz: { foo: 42 }, bar: [{ foo: 123 }] } };
            const actual = factoryNotationFor(input, additionalConversion);
            expect(actual).toEqual("{wrapped: {baz: newFoo(42), bar: [newFoo(123)]}}");
        });
    });
});
