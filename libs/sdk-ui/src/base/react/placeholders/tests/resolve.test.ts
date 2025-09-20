// (C) 2019-2025 GoodData Corporation

import { flow } from "lodash-es";
import { describe, expect, it } from "vitest";

import { newAttribute, newAttributeSort, newMeasure, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import { PlaceholdersState } from "../context.js";
import { newComposedPlaceholder, newPlaceholder } from "../factory.js";
import {
    resolveComposedPlaceholderValue,
    resolvePlaceholderValue,
    resolveValueWithPlaceholders,
    setPlaceholder,
} from "../resolve.js";

export const emptyState: PlaceholdersState = { placeholders: {} };

describe("resolvePlaceholderValue", () => {
    it("should resolve default value", () => {
        const testMeasure = newMeasure("test-measure");
        const placeholder = newPlaceholder(testMeasure);
        expect(resolvePlaceholderValue(placeholder, emptyState)).toEqual(testMeasure);
    });

    it("should resolve active value", () => {
        const testMeasure = newMeasure("test-measure");
        const placeholder = newPlaceholder(testMeasure);
        const updatedMeasure = newMeasure("updated-measure");
        const updatedState = setPlaceholder(placeholder, updatedMeasure, emptyState);
        expect(resolvePlaceholderValue(placeholder, updatedState)).toEqual(updatedMeasure);
    });

    it("should fallback to default value, when active value is not defined", () => {
        const testMeasure = newMeasure("test-measure");
        const placeholder = newPlaceholder(testMeasure);
        const updatedState = setPlaceholder(placeholder, undefined, emptyState);
        expect(resolvePlaceholderValue(placeholder, updatedState)).toEqual(testMeasure);
    });
});

describe("resolveComposedPlaceholderValue", () => {
    it("should be resolved as tuple of resolved placeholder values by default", () => {
        const testMeasure1 = newMeasure("test-measure1");
        const testMeasure2 = newMeasure("test-measure2");
        const placeholder1 = newPlaceholder(testMeasure1);
        const placeholder2 = newPlaceholder(testMeasure2);
        const composedPlaceholder = newComposedPlaceholder([placeholder1, placeholder2]);

        expect(resolveComposedPlaceholderValue(composedPlaceholder, emptyState)).toEqual([
            testMeasure1,
            testMeasure2,
        ]);
    });

    it("should be resolved to active placeholder values", () => {
        const placeholder1 = newPlaceholder();
        const placeholder2 = newPlaceholder();

        const composedPlaceholder = newComposedPlaceholder([placeholder1, placeholder2]);

        const testMeasure1 = newMeasure("test-measure1");
        const testMeasure2 = newMeasure("test-measure2");

        const updatedState = flow(
            (s) => setPlaceholder(placeholder1, testMeasure1, s),
            (s) => setPlaceholder(placeholder2, testMeasure2, s),
        )(emptyState);

        expect(resolveComposedPlaceholderValue(composedPlaceholder, updatedState)).toEqual([
            testMeasure1,
            testMeasure2,
        ]);
    });

    it("should perform computation", () => {
        const testMeasure1 = newMeasure("test-measure1");
        const testMeasure2 = newMeasure("test-measure2");
        const placeholder1 = newPlaceholder(testMeasure1);
        const placeholder2 = newPlaceholder([testMeasure2]);

        const composedPlaceholder = newComposedPlaceholder(
            [placeholder1, placeholder2],
            ([measure, measures]) => {
                return [...measures, measure];
            },
        );

        expect(resolveComposedPlaceholderValue(composedPlaceholder, emptyState)).toEqual([
            testMeasure2,
            testMeasure1,
        ]);
    });

    it("should propagate resolution context to composed placeholder", () => {
        const commonMeasure = newMeasure("common-measure");
        const commonMeasures = newPlaceholder([commonMeasure]);
        const performanceMeasure = newMeasure("performance-measure");
        const performanceMeasures = newPlaceholder([performanceMeasure]);

        interface IResolutionContext {
            includeCommonMeasures?: boolean;
            includePerformanceMeasures?: boolean;
        }

        const composedPlaceholder = newComposedPlaceholder(
            [commonMeasures, performanceMeasures],
            (
                [commonMeasures, performanceMeasures],
                { includeCommonMeasures, includePerformanceMeasures }: IResolutionContext = {},
            ) => {
                const includedMeasures = [];

                if (includeCommonMeasures) {
                    includedMeasures.push(...commonMeasures);
                }
                if (includePerformanceMeasures) {
                    includedMeasures.push(...performanceMeasures);
                }

                return includedMeasures;
            },
        );

        expect(resolveComposedPlaceholderValue(composedPlaceholder, emptyState)).toEqual([]);
        expect(
            resolveComposedPlaceholderValue(composedPlaceholder, emptyState, { includeCommonMeasures: true }),
        ).toEqual([commonMeasure]);
        expect(
            resolveComposedPlaceholderValue(composedPlaceholder, emptyState, {
                includePerformanceMeasures: true,
            }),
        ).toEqual([performanceMeasure]);
    });
});

describe("resolveValueWithPlaceholders", () => {
    describe("should not touch value that is not placeholder", () => {
        type Scenario = [scenarioName: string, value: any];
        const testMeasure = newMeasure("test-measure1");
        const testAttribute = newAttribute("test-attribute");
        const testFilter = newPositiveAttributeFilter("test-attribute", { values: ["Test"] });
        const testSort = newAttributeSort(testAttribute, "asc");

        const scenarios: Scenario[] = [
            ["null", null],
            ["undefined", undefined],
            ["empty object", {}],
            ["empty array", []],
            ["measure", testMeasure],
            ["attribute", testAttribute],
            ["filter", testFilter],
            ["sort", testSort],
        ];

        it.each(scenarios)("should not touch value that is not placeholder: %s", (_, value) => {
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual(value);
        });
    });

    describe("should resolve placeholder holding single value", () => {
        type Scenario = [scenarioName: string, value: any, resolvedValue: any];
        const testMeasure = newMeasure("test-measure1");
        const testAttribute = newAttribute("test-attribute");
        const testFilter = newPositiveAttributeFilter("test-attribute", { values: ["Test"] });
        const testSort = newAttributeSort(testAttribute, "asc");
        const measurePlaceholder = newPlaceholder(testMeasure);
        const attributePlaceholder = newPlaceholder(testAttribute);
        const filterPlaceholder = newPlaceholder(testFilter);
        const sortPlaceholder = newPlaceholder(testSort);

        const scenarios: Scenario[] = [
            ["measurePlaceholder", measurePlaceholder, testMeasure],
            ["attributePlaceholder", attributePlaceholder, testAttribute],
            ["filterPlaceholder", filterPlaceholder, testFilter],
            ["sortPlaceholder", sortPlaceholder, testSort],
        ];

        it.each(scenarios)("%s", (_, value, expectedValue) => {
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual(expectedValue);
        });
    });

    describe("should resolve placeholder holding multiple values", () => {
        type Scenario = [scenarioName: string, value: any, resolvedValue: any];
        const testMeasure = newMeasure("test-measure1");
        const testAttribute = newAttribute("test-attribute");
        const testFilter = newPositiveAttributeFilter("test-attribute", { values: ["Test"] });
        const testSort = newAttributeSort(testAttribute, "asc");
        const measuresPlaceholder = newPlaceholder([testMeasure]);
        const attributesPlaceholder = newPlaceholder([testAttribute]);
        const filtersPlaceholder = newPlaceholder([testFilter]);
        const sortsPlaceholder = newPlaceholder([testSort]);

        const scenarios: Scenario[] = [
            ["measuresPlaceholder", measuresPlaceholder, [testMeasure]],
            ["attributesPlaceholder", attributesPlaceholder, [testAttribute]],
            ["filtersPlaceholder", filtersPlaceholder, [testFilter]],
            ["sortsPlaceholder", sortsPlaceholder, [testSort]],
        ];

        it.each(scenarios)("%s", (_, value, expectedValue) => {
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual(expectedValue);
        });
    });

    describe("should resolve array with placeholders", () => {
        it("should not touch values that are not placeholder", () => {
            const testMeasure = newMeasure("test-measure1");
            const testAttribute = newAttribute("test-attribute");
            const testFilter = newPositiveAttributeFilter("test-attribute", { values: ["Test"] });
            const testSort = newAttributeSort(testAttribute, "asc");

            const values = [null, undefined, {}, [], testMeasure, testAttribute, testFilter, testSort];

            expect(resolveValueWithPlaceholders(values, emptyState)).toEqual(values);
        });

        it("should resolve array placeholders holding single value", () => {
            const testMeasure = newMeasure("test-measure1");
            const testAttribute = newAttribute("test-attribute");
            const testFilter = newPositiveAttributeFilter("test-attribute", { values: ["Test"] });
            const testSort = newAttributeSort(testAttribute, "asc");
            const measurePlaceholder = newPlaceholder(testMeasure);
            const attributePlaceholder = newPlaceholder(testAttribute);
            const filterPlaceholder = newPlaceholder(testFilter);
            const sortPlaceholder = newPlaceholder(testSort);
            const value = [measurePlaceholder, attributePlaceholder, filterPlaceholder, sortPlaceholder];

            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([
                testMeasure,
                testAttribute,
                testFilter,
                testSort,
            ]);
        });

        it("should resolve array with placeholders holding array values and flatten their result", () => {
            const testMeasure = newMeasure("test-measure1");
            const testAttribute = newAttribute("test-attribute");
            const measuresPlaceholder = newPlaceholder([testMeasure]);
            const attributesPlaceholder = newPlaceholder([testAttribute]);

            const value = [measuresPlaceholder, attributesPlaceholder];

            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([testMeasure, testAttribute]);
        });

        it("should resolve array with composed placeholders", () => {
            const testMeasure1 = newMeasure("test-measure1");
            const testMeasure2 = newMeasure("test-measure2");
            const placeholder1 = newPlaceholder(testMeasure1);
            const placeholder2 = newPlaceholder(testMeasure2);
            const composedPlaceholder = newComposedPlaceholder([placeholder1, placeholder2]);

            const value = [composedPlaceholder];
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([testMeasure1, testMeasure2]);
        });

        it("should resolve array with mixed placeholders", () => {
            const testMeasure = newMeasure("test-measure");
            const testAttribute = newAttribute("test-attribute");
            const measurePlaceholder = newPlaceholder(testMeasure);
            const attributesPlaceholder = newPlaceholder([testAttribute]);
            const composedPlaceholder = newComposedPlaceholder(
                [measurePlaceholder, attributesPlaceholder],
                ([measure, attributes]) => [measure, ...attributes],
            );

            const value = [measurePlaceholder, attributesPlaceholder, composedPlaceholder];
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([
                testMeasure,
                testAttribute,
                testMeasure,
                testAttribute,
            ]);
        });

        it("should omit undefined values from placeholders, but keep other undefined values", () => {
            const measurePlaceholder = newPlaceholder();
            const attributePlaceholder = newPlaceholder();
            const composedPlaceholder = newComposedPlaceholder([measurePlaceholder, attributePlaceholder]);

            const value = [undefined, measurePlaceholder, attributePlaceholder, composedPlaceholder];
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([undefined]);
        });
    });
});
