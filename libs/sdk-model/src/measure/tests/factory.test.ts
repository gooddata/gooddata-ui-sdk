// (C) 2019 GoodData Corporation
import { newPositiveAttributeFilter } from "../../filter/factory";
import { newArithmeticMeasure, newMeasure, newPopMeasure, newPreviousPeriodMeasure } from "../factory";
import {
    IMeasure,
    IMeasureDefinition,
    IArithmeticMeasureDefinition,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
} from "..";

describe("measure factories", () => {
    describe("newMeasure", () => {
        it("should return a simple measure", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "m_foo",
                },
            };
            expect(newMeasure("foo")).toEqual(expected);
        });
        it("should return a measure with alias", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    alias: "bar",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "m_foo",
                },
            };
            expect(newMeasure("foo", m => m.alias("bar"))).toEqual(expected);
        });
        it("should return a measure with custom localIdentifier", () => {
            const expected: IMeasure<IMeasureDefinition> = {
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
            expect(newMeasure("foo", undefined, "custom")).toEqual(expected);
        });
        it("should return a measure with format", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    format: "bar",
                    localIdentifier: "m_foo",
                },
            };
            expect(newMeasure("foo", m => m.format("bar"))).toEqual(expected);
        });
        it("should return a measure with title", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    title: "bar",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                        },
                    },
                    localIdentifier: "m_foo",
                },
            };
            expect(newMeasure("foo", m => m.title("bar"))).toEqual(expected);
        });
        it("should return a measure with a filter", () => {
            const expected: IMeasure<IMeasureDefinition> = {
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
                                        in: { uris: ["baz"] },
                                    },
                                },
                            ],
                        },
                    },
                    localIdentifier: "m_foo",
                },
            };
            expect(
                newMeasure("foo", m => m.filters(newPositiveAttributeFilter("filter", { uris: ["baz"] }))),
            ).toEqual(expected);
        });
    });

    describe("newArithmeticMeasure", () => {
        it("should return a simple arithmetic measure", () => {
            const expected: IMeasure<IArithmeticMeasureDefinition> = {
                measure: {
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: ["foo", "bar"],
                            operator: "sum",
                        },
                    },
                    localIdentifier: "m_foo_bar",
                },
            };
            expect(newArithmeticMeasure(["foo", "bar"], "sum")).toEqual(expected);
        });
    });

    describe("newPopMeasure", () => {
        it("should return a simple PoP measure", () => {
            const expected: IMeasure<IPoPMeasureDefinition> = {
                measure: {
                    definition: {
                        popMeasureDefinition: {
                            measureIdentifier: "foo",
                            popAttribute: { identifier: "attr" },
                        },
                    },
                    localIdentifier: "m_foo_attr",
                },
            };
            expect(newPopMeasure("foo", "attr")).toEqual(expected);
        });
    });

    describe("newPreviousPeriodMeasure", () => {
        it("should return a simple PP measure when supplied with strings", () => {
            const expected: IMeasure<IPreviousPeriodMeasureDefinition> = {
                measure: {
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "foo",
                            dateDataSets: [{ dataSet: { identifier: "bar" }, periodsAgo: 3 }],
                        },
                    },
                    localIdentifier: "m_foo_previous_period",
                },
            };
            expect(newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }])).toEqual(expected);
        });
    });
});
