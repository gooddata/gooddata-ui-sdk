// (C) 2007-2019 GoodData Corporation
import { GdcVisualizationObject } from "../GdcVisualizationObject";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import IMeasure = GdcVisualizationObject.IMeasure;
import IAttribute = GdcVisualizationObject.IAttribute;
import DateFilter = GdcVisualizationObject.DateFilter;
import Filter = GdcVisualizationObject.Filter;
import IMeasureDefinitionType = GdcVisualizationObject.IMeasureDefinitionType;
import IArithmeticMeasureDefinition = GdcVisualizationObject.IArithmeticMeasureDefinition;
import IMeasureValueFilter = GdcVisualizationObject.IMeasureValueFilter;

describe("GdcVisualizationObject", () => {
    const attribute: IAttribute = {
        visualizationAttribute: {
            localIdentifier: "m1",
            displayForm: {
                uri: "/gdc/mock/measure",
            },
        },
    };
    const simpleMeasure: IMeasure = {
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
    const simpleMeasureDefinition: IMeasureDefinitionType = {
        measureDefinition: {
            item: {
                uri: "/gdc/mock/measure",
            },
        },
    };
    const arithmeticMeasureDefinition: IArithmeticMeasureDefinition = {
        arithmeticMeasure: {
            measureIdentifiers: ["/gdc/mock/measure"],
            operator: "sum",
        },
    };
    const popMeasureDefinition: IMeasureDefinitionType = {
        popMeasureDefinition: {
            measureIdentifier: "m1",
            popAttribute: {
                uri: "/gdc/mock/measure",
            },
        },
    };
    const previousPeriodMeasureDefinition: IMeasureDefinitionType = {
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
    const positiveAttributeFilter: Filter = {
        positiveAttributeFilter: {
            displayForm: {
                uri: "/gdc/mock/attribute",
            },
            in: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
        },
    };
    const negativeAttributeFilter: Filter = {
        negativeAttributeFilter: {
            displayForm: {
                uri: "/gdc/mock/date",
            },
            notIn: ["/gdc/mock/attribute/value_1", "/gdc/mock/attribute/value_2"],
        },
    };
    const relativeDateFilter: Filter = {
        relativeDateFilter: {
            dataSet: {
                uri: "/gdc/mock/date",
            },
            granularity: "GDC.time.year",
            from: -1,
            to: -1,
        },
    };
    const absoluteDateFilter: DateFilter = {
        absoluteDateFilter: {
            dataSet: {
                uri: "/gdc/mock/date",
            },
            from: "2017-06-12",
            to: "2018-07-11",
        },
    };
    const measureValueFilter: IMeasureValueFilter = {
        measureValueFilter: {
            measure: {
                uri: "/gdc/mock/date",
            },
            condition: {
                comparison: {
                    operator: "GREATER_THAN",
                    value: 42,
                },
            },
        },
    };

    describe("isMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute", attribute],
            [true, "measure", simpleMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isAttribute", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute", attribute],
            [false, "measure", simpleMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isAttribute(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "simple measure definition", simpleMeasureDefinition],
            [false, "arithmetic measure definition", arithmeticMeasureDefinition],
            [false, "pop measure definition", popMeasureDefinition],
            [false, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isArithmeticMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure definition", simpleMeasureDefinition],
            [true, "arithmetic measure definition", arithmeticMeasureDefinition],
            [false, "pop measure definition", popMeasureDefinition],
            [false, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isArithmeticMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isPopMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure definition", simpleMeasureDefinition],
            [false, "arithmetic measure definition", arithmeticMeasureDefinition],
            [true, "pop measure definition", popMeasureDefinition],
            [false, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isPopMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isPreviousPeriodMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure definition", simpleMeasureDefinition],
            [false, "arithmetic measure definition", arithmeticMeasureDefinition],
            [false, "pop measure definition", popMeasureDefinition],
            [true, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isPreviousPeriodMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [true, "positive attribute filter", positiveAttributeFilter],
            [true, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "relative date filter", relativeDateFilter],
            [true, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isPositiveAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [true, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isPositiveAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isNegativeAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [true, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isNegativeAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAbsoluteDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [true, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isAbsoluteDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isRelativeDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isRelativeDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureValueFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [true, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcVisualizationObject.isMeasureValueFilter(input)).toBe(expectedResult);
        });
    });
});
