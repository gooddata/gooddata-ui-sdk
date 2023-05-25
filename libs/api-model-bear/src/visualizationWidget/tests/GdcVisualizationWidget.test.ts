// (C) 2021 GoodData Corporation
import { describe, it, expect } from "vitest";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isDrillFromAttribute, isDrillFromMeasure } from "../GdcVisualizationWidget.js";
import { drillFromAttribute, drillFromMeasure } from "./GdcVisualizationWidget.fixtures.js";

describe("GdcVisualizationWidget", () => {
    describe("DrillFromType", () => {
        describe("isDrillFromMeasure", () => {
            const Scenarios: Array<[boolean, string, any]> = [
                ...InvalidInputTestCases,
                [true, "drill from measure", drillFromMeasure],
                [false, "drill from attribute", drillFromAttribute],
            ];

            it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
                expect(isDrillFromMeasure(input)).toBe(expectedResult);
            });
        });

        describe("isDrillFromAttribute", () => {
            const Scenarios: Array<[boolean, string, any]> = [
                ...InvalidInputTestCases,
                [false, "drill from measure", drillFromMeasure],
                [true, "drill from attribute", drillFromAttribute],
            ];

            it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
                expect(isDrillFromAttribute(input)).toBe(expectedResult);
            });
        });
    });
});
