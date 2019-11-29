// (C) 2019 GoodData Corporation

import { Velocity, Won } from "../../../__mocks__/model";
import { modifyMeasure, newArithmeticMeasure, newPopMeasure, newPreviousPeriodMeasure } from "../factory";
import {
    measureLocalId,
    measureUri,
    measureIdentifier,
    measureDoesComputeRatio,
    measureMasterIdentifier,
    measureArithmeticOperands,
    measureArithmeticOperator,
    measureAlias,
    measureTitle,
    measureFormat,
    measureAggregation,
    measurePopAttribute,
    measurePreviousPeriodDateDataSets,
    IPreviousPeriodDateDataSet,
    measureFilters,
} from "../index";
import { ObjRef } from "../../base";
import { newPositiveAttributeFilter } from "../../filter/factory";
import { IFilter } from "../../filter";

const SimpleMeasureWithIdentifier = Won;
const SimpleMeasureWithRatio = modifyMeasure(Won, m => m.ratio());
const SimpleMeasureWithUri = modifyMeasure(Won);
SimpleMeasureWithUri.measure.definition.measureDefinition.item = { uri: "/uri" };
const SimpleMeasureWithFilters = modifyMeasure(Won, m =>
    m.filters(newPositiveAttributeFilter("myAttribute", ["foo"])),
);

const ArithmeticMeasure = newArithmeticMeasure([Won, Velocity.Min], "sum");
const PopMeasure = newPopMeasure(measureLocalId(Won), "myPopAttribute");
const PreviousPeriodMeasure = newPreviousPeriodMeasure(Won, [{ dataSet: "dataSet", periodsAgo: 1 }]);

describe("measureUri", () => {
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined if measure with identifier", SimpleMeasureWithIdentifier, undefined],
        ["undefined for arithmetic measure", ArithmeticMeasure, undefined],
        ["undefined for PoP measure", PopMeasure, undefined],
        ["undefined for Previous Period measure", PreviousPeriodMeasure, undefined],
        ["uri for simple measure using URI", SimpleMeasureWithUri, "/uri"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureUri(measureArg)).toEqual(expectedResult);
    });
});

describe("measureIdentifier", () => {
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined if measure with uri", SimpleMeasureWithUri, undefined],
        ["undefined for arithmetic measure", ArithmeticMeasure, undefined],
        ["undefined for PoP measure", PopMeasure, undefined],
        ["undefined for Previous Period measure", PreviousPeriodMeasure, undefined],
        ["identifier for simple measure using URI", SimpleMeasureWithIdentifier, "afSEwRwdbMeQ"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureIdentifier(measureArg)).toEqual(expectedResult);
    });
});

describe("measureDoesComputeRatio", () => {
    const Scenarios: Array<[boolean, string, any]> = [
        [false, "undefined", undefined],
        [false, "null", null],
        [false, "arithmetic measure", ArithmeticMeasure],
        [false, "PoP measure", PopMeasure],
        [false, "Previous Period measure", PreviousPeriodMeasure],
        [false, "simple measure without ratio", SimpleMeasureWithIdentifier],
        [true, "simple measure with ratio", SimpleMeasureWithRatio],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, measureArg) => {
        expect(measureDoesComputeRatio(measureArg)).toEqual(expectedResult);
    });
});

describe("measureMasterIdentifier", () => {
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for arithmetic measure", ArithmeticMeasure, undefined],
        ["undefined for simple measure", SimpleMeasureWithIdentifier, undefined],
        ["simple measure local id for PoP measure", PopMeasure, "m_afSEwRwdbMeQ"],
        ["simple measure local id for PreviousPeriod measure", PreviousPeriodMeasure, "m_afSEwRwdbMeQ"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureMasterIdentifier(measureArg)).toEqual(expectedResult);
    });
});

describe("measureArithmeticOperands", () => {
    const Scenarios: Array<[string, any, string[] | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for simple measure", SimpleMeasureWithIdentifier, undefined],
        ["simple measure local id for PoP measure", PopMeasure, undefined],
        ["simple measure local id for PreviousPeriod measure", PreviousPeriodMeasure, undefined],
        [
            "undefined for arithmetic measure",
            ArithmeticMeasure,
            ["m_afSEwRwdbMeQ", "m_fact.stagehistory.velocity_min"],
        ],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureArithmeticOperands(measureArg)).toEqual(expectedResult);
    });
});

describe("measureArithmeticOperator", () => {
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for simple measure", SimpleMeasureWithIdentifier, undefined],
        ["simple measure local id for PoP measure", PopMeasure, undefined],
        ["simple measure local id for PreviousPeriod measure", PreviousPeriodMeasure, undefined],
        ["undefined for arithmetic measure", ArithmeticMeasure, "sum"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureArithmeticOperator(measureArg)).toEqual(expectedResult);
    });
});

describe("measureAlias", () => {
    const MeasureWithAlias = modifyMeasure(SimpleMeasureWithIdentifier, m => m.alias("customAlias"));
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for measure without alias", SimpleMeasureWithIdentifier, undefined],
        ["alias value when defined", MeasureWithAlias, "customAlias"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureAlias(measureArg)).toEqual(expectedResult);
    });
});

describe("measureTitle", () => {
    const MeasureWithTitle = modifyMeasure(SimpleMeasureWithIdentifier, m => m.title("customTitle"));
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for measure without title", SimpleMeasureWithIdentifier, undefined],
        ["title value when defined", MeasureWithTitle, "customTitle"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureTitle(measureArg)).toEqual(expectedResult);
    });
});

describe("measureFormat", () => {
    const MeasureWithFormat = modifyMeasure(SimpleMeasureWithIdentifier, m => m.format("customFormat"));
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for measure without format", SimpleMeasureWithIdentifier, undefined],
        ["format value when defined", MeasureWithFormat, "customFormat"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureFormat(measureArg)).toEqual(expectedResult);
    });
});

describe("measureAggregation", () => {
    const MeasureWithAggregation = modifyMeasure(SimpleMeasureWithIdentifier, m => m.aggregation("median"));
    const Scenarios: Array<[string, any, string | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for measure without aggregation", SimpleMeasureWithIdentifier, undefined],
        ["aggregation value when defined", MeasureWithAggregation, "median"],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureAggregation(measureArg)).toEqual(expectedResult);
    });
});

describe("measureFilters", () => {
    const Scenarios: Array<[string, any, IFilter[] | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for measure without filters", SimpleMeasureWithIdentifier, undefined],
        [
            "filter values when defined",
            SimpleMeasureWithFilters,
            [
                {
                    positiveAttributeFilter: {
                        displayForm: { identifier: "myAttribute" },
                        in: { values: ["foo"] },
                    },
                },
            ],
        ],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measureFilters(measureArg)).toEqual(expectedResult);
    });
});

describe("measurePopAttribute", () => {
    const Scenarios: Array<[string, any, ObjRef | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        ["undefined for measure without PoP attribute", SimpleMeasureWithIdentifier, undefined],
        ["PoP attribute value when defined", PopMeasure, { identifier: "myPopAttribute" }],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measurePopAttribute(measureArg)).toEqual(expectedResult);
    });
});

describe("measurePreviousPeriodDateDataSets", () => {
    const Scenarios: Array<[string, any, IPreviousPeriodDateDataSet[] | undefined]> = [
        ["undefined if measure is undefined", undefined, undefined],
        ["undefined if measure is null", null, undefined],
        [
            "undefined for measure without previous period date data sets",
            SimpleMeasureWithIdentifier,
            undefined,
        ],
        [
            "previous period date data set values when defined",
            PreviousPeriodMeasure,
            [{ dataSet: { identifier: "dataSet" }, periodsAgo: 1 }],
        ],
    ];

    it.each(Scenarios)("should return %s", (_desc, measureArg, expectedResult) => {
        expect(measurePreviousPeriodDateDataSets(measureArg)).toEqual(expectedResult);
    });
});
