// (C) 2018 GoodData Corporation
import { positiveAttributeFilter, attributeFilter } from "../filters";
import { measure, arithmeticMeasure, popMeasure, previousPeriodMeasure } from "../measures";

describe("Measures", () => {
    describe("measure", () => {
        it("should return a simple measure", () => {
            const expected = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                },
            };
            expect(measure("foo")).toMatchObject(expected);
        });
        it("should return a measure with alias", () => {
            const expected = {
                measure: {
                    alias: "bar",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                },
            };
            expect(measure("foo").alias("bar")).toMatchObject(expected);
        });
        it("should return a measure with custom localIdentifier", () => {
            const expected = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "custom",
                },
            };
            expect(measure("foo").localIdentifier("custom")).toMatchObject(expected);
        });
        it("should return a measure with format", () => {
            const expected = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    format: "bar",
                },
            };
            expect(measure("foo").format("bar")).toMatchObject(expected);
        });
        it("should return a measure with title", () => {
            const expected = {
                measure: {
                    title: "bar",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                },
            };
            expect(measure("foo").title("bar")).toMatchObject(expected);
        });
        it("should return a measure with a filter", () => {
            const expected = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                            filters: [
                                {
                                    positiveAttributeFilter: {
                                        displayForm: {
                                            identifier: "filter",
                                        },
                                        in: ["baz"],
                                    },
                                },
                            ],
                        },
                    },
                },
            };
            expect(measure("foo").filters(positiveAttributeFilter("filter", ["baz"]))).toMatchObject(
                expected,
            );
        });

        it("should return a measure with a text filter", () => {
            const expected = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                            filters: [
                                {
                                    positiveAttributeFilter: {
                                        displayForm: {
                                            identifier: "filter",
                                        },
                                        in: ["val1"],
                                        textFilter: true,
                                    },
                                },
                            ],
                        },
                    },
                },
            };
            expect(measure("foo").filters(attributeFilter("filter").in("val1"))).toMatchObject(expected);
        });
    });

    describe("arithmeticMeasure", () => {
        it("should return a simple arithmetic measure", () => {
            const expected = {
                measure: {
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: ["foo"],
                            operator: "sum",
                        },
                    },
                },
            };
            expect(arithmeticMeasure(["foo"], "sum")).toMatchObject(expected);
        });
    });

    describe("popMeasure", () => {
        it("should return a simple PoP measure", () => {
            const expected = {
                measure: {
                    definition: {
                        popMeasureDefinition: {
                            measureIdentifier: "foo",
                            popAttribute: { identifier: "attr" },
                        },
                    },
                },
            };
            expect(popMeasure("foo", "attr")).toMatchObject(expected);
        });
    });

    describe("previousPeriodMeasure", () => {
        it("should return a simple PP measure when supplied with ObjectQualifiers", () => {
            const expected = {
                measure: {
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "foo",
                            dateDataSets: [{ dataSet: { identifier: "bar" }, periodsAgo: 3 }],
                        },
                    },
                },
            };
            expect(
                previousPeriodMeasure("foo", [{ dataSet: { identifier: "bar" }, periodsAgo: 3 }]),
            ).toMatchObject(expected);
        });
        it("should return a simple PP measure when supplied with strings", () => {
            const expected = {
                measure: {
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "foo",
                            dateDataSets: [{ dataSet: { identifier: "bar" }, periodsAgo: 3 }],
                        },
                    },
                },
            };
            expect(previousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }])).toMatchObject(expected);
        });
    });
});
