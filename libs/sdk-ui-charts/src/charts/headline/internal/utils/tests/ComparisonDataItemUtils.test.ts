// (C) 2023-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { EvaluationType } from "../../interfaces/BaseHeadlines.js";
import { TEST_COLOR_CONFIGS, TEST_COMPARISON_PALETTE } from "../../tests/TestData.fixtures.js";
import { getComparisonColor } from "../ComparisonDataItemUtils.js";

describe("ComparisonDataItemUtils", () => {
    describe("getComparisonColor", () => {
        it("return null when color config is disabled", () => {
            expect(
                getComparisonColor(
                    { disabled: true },
                    EvaluationType.POSITIVE_VALUE,
                    TEST_COMPARISON_PALETTE,
                ),
            ).toBeNull();
        });

        it("return color correctly", () => {
            expect(getComparisonColor(TEST_COLOR_CONFIGS, EvaluationType.POSITIVE_VALUE)).toEqual(
                "rgb(5,5,5)",
            );
            expect(getComparisonColor(TEST_COLOR_CONFIGS, EvaluationType.NEGATIVE_VALUE)).toEqual(
                "rgb(0,193,141)",
            );
            expect(getComparisonColor(TEST_COLOR_CONFIGS, EvaluationType.EQUALS_VALUE)).toEqual(
                "rgb(148,161,173)",
            );
        });

        it("return color correctly with custom palette", () => {
            expect(
                getComparisonColor(
                    TEST_COLOR_CONFIGS,
                    EvaluationType.POSITIVE_VALUE,
                    TEST_COMPARISON_PALETTE,
                ),
            ).toEqual("rgb(5,5,5)");
            expect(
                getComparisonColor(
                    TEST_COLOR_CONFIGS,
                    EvaluationType.NEGATIVE_VALUE,
                    TEST_COMPARISON_PALETTE,
                ),
            ).toEqual("rgb(1,1,1)");
            expect(
                getComparisonColor(TEST_COLOR_CONFIGS, EvaluationType.EQUALS_VALUE, TEST_COMPARISON_PALETTE),
            ).toEqual("rgb(3,3,3)");
        });
    });
});
