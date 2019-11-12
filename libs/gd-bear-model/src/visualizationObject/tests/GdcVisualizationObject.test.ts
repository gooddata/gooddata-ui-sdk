// (C) 2007-2019 GoodData Corporation
import { GdcVisualizationObject } from "../GdcVisualizationObject";
import IMeasure = GdcVisualizationObject.IMeasure;
import IAttribute = GdcVisualizationObject.IAttribute;
import BucketItem = GdcVisualizationObject.BucketItem;
import ExtendedFilter = GdcVisualizationObject.ExtendedFilter;
import AttributeFilter = GdcVisualizationObject.AttributeFilter;
import DateFilter = GdcVisualizationObject.DateFilter;
import Filter = GdcVisualizationObject.Filter;
import IMeasureDefinitionType = GdcVisualizationObject.IMeasureDefinitionType;
import IArithmeticMeasureDefinition = GdcVisualizationObject.IArithmeticMeasureDefinition;

describe("GdcVisualizationObject", () => {
    describe("isMeasure", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isMeasure(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isMeasure(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when visualization attribute is tested", () => {
            const attribute: IAttribute = {
                visualizationAttribute: {
                    localIdentifier: "m1",
                    displayForm: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isMeasure(attribute);
            expect(result).toEqual(false);
        });

        it("should return true when measure is tested", () => {
            const measure: IMeasure = {
                measure: {
                    localIdentifier: "m1",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "/gdc/mock/measure",
                            },
                        },
                    },
                },
            };
            const result = GdcVisualizationObject.isMeasure(measure);
            expect(result).toEqual(true);
        });
    });

    describe("isAttribute", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isAttribute(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isAttribute(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when measure is tested", () => {
            const measure: IMeasure = {
                measure: {
                    localIdentifier: "m1",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "/gdc/mock/measure",
                            },
                        },
                    },
                },
            };
            const result = GdcVisualizationObject.isAttribute(measure);
            expect(result).toEqual(false);
        });

        it("should return true when visualization attribute is tested", () => {
            const attribute: IAttribute = {
                visualizationAttribute: {
                    localIdentifier: "m1",
                    displayForm: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isAttribute(attribute);
            expect(result).toEqual(true);
        });
    });

    describe("isMeasureDefinition", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it("should return true when simple measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });

        it("should return false when arithmetic measure definition is tested", () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ["/gdc/mock/measure"],
                    operator: "sum",
                },
            };
            const result = GdcVisualizationObject.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return false when pop measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: "m1",
                    popAttribute: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return false when previous period measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                previousPeriodMeasure: {
                    measureIdentifier: "m1",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/gdc/mock/date",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            };
            const result = GdcVisualizationObject.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });
    });

    describe("isArithmeticMeasureDefinition", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isArithmeticMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isArithmeticMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when simple measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return true when arithmetic measure definition is tested", () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ["/gdc/mock/measure"],
                    operator: "sum",
                },
            };
            const result = GdcVisualizationObject.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });

        it("should return false when pop measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: "m1",
                    popAttribute: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return false when previous period measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                previousPeriodMeasure: {
                    measureIdentifier: "m1",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/gdc/mock/date",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            };
            const result = GdcVisualizationObject.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });
    });

    describe("isPopMeasureDefinition", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isPopMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isPopMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when simple measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isPopMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return false when arithmetic measure definition is tested", () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ["/gdc/mock/measure"],
                    operator: "sum",
                },
            };
            const result = GdcVisualizationObject.isPopMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return true when pop measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: "m1",
                    popAttribute: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isPopMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });

        it("should return false when previous period measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                previousPeriodMeasure: {
                    measureIdentifier: "m1",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/gdc/mock/date",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            };
            const result = GdcVisualizationObject.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });
    });

    describe("isPreviousPeriodMeasureDefinition", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isPreviousPeriodMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isPreviousPeriodMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when simple measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return false when arithmetic measure definition is tested", () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ["/gdc/mock/measure"],
                    operator: "sum",
                },
            };
            const result = GdcVisualizationObject.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return false when pop measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: "m1",
                    popAttribute: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it("should return true when previous period measure definition is tested", () => {
            const measureDefinition: IMeasureDefinitionType = {
                previousPeriodMeasure: {
                    measureIdentifier: "m1",
                    dateDataSets: [
                        {
                            dataSet: {
                                uri: "/gdc/mock/date",
                            },
                            periodsAgo: 1,
                        },
                    ],
                },
            };
            const result = GdcVisualizationObject.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });
    });

    describe("isAttributeFilter", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when relative date filter is tested", () => {
            const filter: Filter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: "/gdc/mock/date",
                    },
                    granularity: "GDC.time.year",
                    from: -1,
                    to: -1,
                },
            };
            const result = GdcVisualizationObject.isAttributeFilter(filter);
            expect(result).toEqual(false);
        });

        it("should return true when negative attribute filter is tested", () => {
            const filter: Filter = {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: "/gdc/mock/date",
                    },
                    notIn: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
                },
            };
            const result = GdcVisualizationObject.isAttributeFilter(filter);
            expect(result).toEqual(true);
        });

        it("should return true when positive attribute filter is tested", () => {
            const filter: Filter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: "/gdc/mock/attribute",
                    },
                    in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
                },
            };
            const result = GdcVisualizationObject.isAttributeFilter(filter);
            expect(result).toEqual(true);
        });
    });

    describe("isPositiveAttributeFilter", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isPositiveAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isPositiveAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when negative attribute filter is tested", () => {
            const filter: AttributeFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: "/gdc/mock/date",
                    },
                    notIn: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
                },
            };
            const result = GdcVisualizationObject.isPositiveAttributeFilter(filter);
            expect(result).toEqual(false);
        });

        it("should return true when positive attribute filter is tested", () => {
            const filter: AttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: "/gdc/mock/attribute",
                    },
                    in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
                },
            };
            const result = GdcVisualizationObject.isPositiveAttributeFilter(filter);
            expect(result).toEqual(true);
        });
    });

    describe("isAbsoluteDateFilter", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isAbsoluteDateFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isAbsoluteDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when relative date filter is tested", () => {
            const filter: DateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: "/gdc/mock/date",
                    },
                    granularity: "GDC.time.year",
                    from: -1,
                    to: -1,
                },
            };
            const result = GdcVisualizationObject.isAbsoluteDateFilter(filter);
            expect(result).toEqual(false);
        });

        it("should return true when absolute date filter is tested", () => {
            const filter: DateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: "/gdc/mock/date",
                    },
                    from: "2017-06-12",
                    to: "2018-07-11",
                },
            };
            const result = GdcVisualizationObject.isAbsoluteDateFilter(filter);
            expect(result).toEqual(true);
        });
    });

    describe("isRelativeDateFilter", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isRelativeDateFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isRelativeDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when absolute date filter is tested", () => {
            const filter: DateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: "/gdc/mock/date",
                    },
                    from: "beginning",
                    to: "to end",
                },
            };
            const result = GdcVisualizationObject.isRelativeDateFilter(filter);
            expect(result).toEqual(false);
        });

        it("should return true when relative date filter is tested", () => {
            const filter: DateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: "/gdc/mock/date",
                    },
                    granularity: "GDC.time.year",
                    from: -1,
                    to: -1,
                },
            };
            const result = GdcVisualizationObject.isRelativeDateFilter(filter);
            expect(result).toEqual(true);
        });
    });

    describe("isAttribute", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isAttribute(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isAttribute(undefined);
            expect(result).toEqual(false);
        });

        it("should return false when measure is tested", () => {
            const measure: BucketItem = {
                measure: {
                    localIdentifier: "m1",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "/gdc/mock/measure",
                            },
                        },
                    },
                },
            };
            const result = GdcVisualizationObject.isAttribute(measure);
            expect(result).toEqual(false);
        });

        it("should return true when visualization attribute is tested", () => {
            const attribute: BucketItem = {
                visualizationAttribute: {
                    localIdentifier: "m1",
                    displayForm: {
                        uri: "/gdc/mock/measure",
                    },
                },
            };
            const result = GdcVisualizationObject.isAttribute(attribute);
            expect(result).toEqual(true);
        });
    });

    describe("isMeasureValueFilter", () => {
        it("should return false when null is tested", () => {
            const result = GdcVisualizationObject.isMeasureValueFilter(null);
            expect(result).toEqual(false);
        });

        it("should return false when undefined is tested", () => {
            const result = GdcVisualizationObject.isMeasureValueFilter(undefined);
            expect(result).toEqual(false);
        });

        it("should return true when measure value filter is tested", () => {
            const filter: ExtendedFilter = {
                measureValueFilter: {
                    measure: {
                        uri: "/gdc/mock/date",
                    },
                },
            };
            const result = GdcVisualizationObject.isMeasureValueFilter(filter);
            expect(result).toEqual(true);
        });

        it("should return false when positive attribute filter is tested", () => {
            const filter: ExtendedFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: "/gdc/mock/attribute",
                    },
                    in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
                },
            };
            const result = GdcVisualizationObject.isMeasureValueFilter(filter);
            expect(result).toEqual(false);
        });
    });
});
