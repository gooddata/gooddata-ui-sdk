// (C) 2021-2022 GoodData Corporation
import { IWidgetAlertBase } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

import {
    evaluateAlertTriggered,
    thresholdFromDecimalToPercent,
    thresholdFromPercentToDecimal,
} from "../alertThresholdUtils.js";

describe("thresholdFromDecimalToPercent", () => {
    it.each([
        [0.4, 40],
        [0.40005, 40.005],
        [123.45678, 12345.678],
    ])("should convert decimal number (%d) to percent (%d)", (input: number, expected: number) => {
        expect(thresholdFromDecimalToPercent(input)).toEqual(expected);
    });
});

describe("thresholdFromPercentToDecimal", () => {
    it.each([
        [40, 0.4],
        [40.005, 0.40005],
        [12345.678, 123.45678],
    ])("should convert percent (%d) to decimal number (%d)", (input: number, expected: number) => {
        expect(thresholdFromPercentToDecimal(input)).toEqual(expected);
    });
});

describe("evaluateAlertTriggered", () => {
    type Scenario = [boolean, number, number, IWidgetAlertBase["whenTriggered"]];
    const scenarios: Scenario[] = [
        [false, 5, 10, "aboveThreshold"],
        [true, 10, 5, "aboveThreshold"],
        [false, 5, 5, "aboveThreshold"],
        [true, 5, 10, "underThreshold"],
        [false, 10, 5, "underThreshold"],
        [false, 5, 5, "underThreshold"],
        [true, -5, -10, "aboveThreshold"],
        [false, -10, -5, "aboveThreshold"],
        [false, -5, -5, "aboveThreshold"],
        [false, -5, -10, "underThreshold"],
        [true, -10, -5, "underThreshold"],
        [false, -5, -5, "underThreshold"],
        [false, -0.5, -0.1, "aboveThreshold"],
        [true, -0.1, -0.5, "aboveThreshold"],
        [false, -0.5, -0.5, "aboveThreshold"],
        [true, -0.5, -0.1, "underThreshold"],
        [false, -0.1, -0.5, "underThreshold"],
        [false, -0.5, -0.5, "underThreshold"],
    ];

    it.each(scenarios)(
        "should return %p when kpi result is %p, threshold is %p and type is %s",
        (expected, kpiResult, threshold, whenTriggered) => {
            expect(evaluateAlertTriggered(kpiResult, threshold, whenTriggered)).toEqual(expected);
        },
    );
});
