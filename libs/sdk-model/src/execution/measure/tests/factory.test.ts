// (C) 2019 GoodData Corporation
import { Velocity, Won } from "../../../../__mocks__/model";
import { newPositiveAttributeFilter } from "../../filter/factory";
import {
    modifyMeasure,
    newArithmeticMeasure,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
} from "../factory";
import {
    IMeasure,
    IMeasureDefinition,
    IArithmeticMeasureDefinition,
    IPoPMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    measureLocalId,
} from "../index";

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
        it("should return a simple measure with different aggregation", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                            aggregation: "sum",
                        },
                    },
                    localIdentifier: "m_foo_sum",
                },
            };
            expect(newMeasure("foo", m => m.aggregation("sum"))).toEqual(expected);
        });
        it("should honor custom-set localId for simple measures with aggregation", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "foo",
                            },
                            aggregation: "sum",
                        },
                    },
                    localIdentifier: "bar",
                },
            };
            expect(newMeasure("foo", m => m.localId("bar").aggregation("sum"))).toEqual(expected);
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
            expect(newMeasure("foo", m => m.localId("custom"))).toEqual(expected);
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

    describe("modifyMeasure", () => {
        const ExistingMeasure = newMeasure("measure1", m => m.localId("measure1"));

        it("should not modify input measure", () => {
            modifyMeasure(ExistingMeasure, m => m.localId("measure2"));

            expect(measureLocalId(ExistingMeasure)).toEqual("measure1");
        });

        it("should create new measure with modified local id", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "measure1",
                            },
                        },
                    },
                    localIdentifier: "measure2",
                },
            };

            expect(modifyMeasure(ExistingMeasure, m => m.localId("measure2"))).toEqual(expected);
        });

        it("should create new measure with modified aggregation and same local id", () => {
            const expected: IMeasure<IMeasureDefinition> = {
                measure: {
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "measure1",
                            },
                            aggregation: "min",
                        },
                    },
                    localIdentifier: "measure1",
                },
            };

            expect(modifyMeasure(ExistingMeasure, m => m.aggregation("min"))).toEqual(expected);
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

        it("should return a simple arithmetic measure from two measure objects", () => {
            const expected: IMeasure<IArithmeticMeasureDefinition> = {
                measure: {
                    definition: {
                        arithmeticMeasure: {
                            measureIdentifiers: ["m_afSEwRwdbMeQ", "m_fact.stagehistory.velocity_min"],
                            operator: "sum",
                        },
                    },
                    localIdentifier: "m_m_afSEwRwdbMeQ_m_fact.stagehistory.velocity_min",
                },
            };
            expect(newArithmeticMeasure([Won, Velocity.Min], "sum")).toEqual(expected);
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

        it("should return a simple PoP measure object", () => {
            const expected: IMeasure<IPoPMeasureDefinition> = {
                measure: {
                    definition: {
                        popMeasureDefinition: {
                            measureIdentifier: "m_afSEwRwdbMeQ",
                            popAttribute: { identifier: "attr" },
                        },
                    },
                    localIdentifier: "m_m_afSEwRwdbMeQ_attr",
                },
            };
            expect(newPopMeasure(Won, "attr")).toEqual(expected);
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

        it("should return a simple PP measure when supplied with objects", () => {
            const expected: IMeasure<IPreviousPeriodMeasureDefinition> = {
                measure: {
                    definition: {
                        previousPeriodMeasure: {
                            measureIdentifier: "m_afSEwRwdbMeQ",
                            dateDataSets: [{ dataSet: { identifier: "bar" }, periodsAgo: 3 }],
                        },
                    },
                    localIdentifier: "m_m_afSEwRwdbMeQ_previous_period",
                },
            };
            expect(newPreviousPeriodMeasure(Won, [{ dataSet: "bar", periodsAgo: 3 }])).toEqual(expected);
        });
    });
});
