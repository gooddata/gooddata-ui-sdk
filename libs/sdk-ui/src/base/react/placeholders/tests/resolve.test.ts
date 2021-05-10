// (C) 2019-2021 GoodData Corporation

import {
    resolveValueWithPlaceholders,
    resolveSinglePlaceholderValue,
    setPlaceholder,
    resolveGroupPlaceholderValue,
    resolveFullGroupPlaceholderValue,
    resolveComputedPlaceholderValue,
} from "../resolve";
import {
    newAttributePlaceholder,
    newFilterPlaceholder,
    newMeasurePlaceholder,
    newSortPlaceholder,
    newMeasureGroupPlaceholder,
    newAttributeGroupPlaceholder,
    newFilterGroupPlaceholder,
    newSortGroupPlaceholder,
    newComputedPlaceholder,
    newGroupPlaceholder,
} from "../factory";
import {
    newMeasure,
    newAttribute,
    newPositiveAttributeFilter,
    newAttributeSort,
    modifySimpleMeasure,
} from "@gooddata/sdk-model";
import { PlaceholdersState } from "../context";
export const emptyState: PlaceholdersState = { placeholders: {}, groupPlaceholders: {} };

export const testMeasure = newMeasure("test-measure");
export const testAttribute = newAttribute("test-attribute");
export const testFilter = newPositiveAttributeFilter("test-attribute", { values: ["Test"] });
export const testSort = newAttributeSort(testAttribute, "asc");

export const measurePlaceholder = newMeasurePlaceholder(testMeasure);
export const attributePlaceholder = newAttributePlaceholder(testAttribute);
export const filterPlaceholder = newFilterPlaceholder(testFilter);
export const sortPlaceholder = newSortPlaceholder(testSort);

export const measureGroupPlaceholder = newMeasureGroupPlaceholder([testMeasure, measurePlaceholder]);
export const attributeGroupPlaceholder = newAttributeGroupPlaceholder([testAttribute, attributePlaceholder]);
export const filterGroupPlaceholder = newFilterGroupPlaceholder([testFilter, filterPlaceholder]);
export const sortGroupPlaceholder = newSortGroupPlaceholder([testSort, sortPlaceholder]);

export const computedPlaceholder = newComputedPlaceholder(
    [measurePlaceholder, filterPlaceholder],
    ([measure, filter]) => {
        return modifySimpleMeasure(measure, (m) => m.filters(filter));
    },
);

export const computedPlaceholderResult = modifySimpleMeasure(testMeasure, (m) => m.filters(testFilter));

// TODO:
// - Test validations

describe("resolveSinglePlaceholderValue", () => {
    it("should resolve default value", () => {
        expect(resolveSinglePlaceholderValue(measurePlaceholder, emptyState)).toBe(testMeasure);
    });

    it("should resolve active value", () => {
        const updatedMeasure = newMeasure("updated-measure");
        const stateWithUpdatedMeasure = setPlaceholder(measurePlaceholder, updatedMeasure, emptyState);
        expect(resolveSinglePlaceholderValue(measurePlaceholder, stateWithUpdatedMeasure)).toBe(
            updatedMeasure,
        );
    });

    it("should fallback to default value, when active value is not defined", () => {
        const stateWithUpdatedMeasure = setPlaceholder(measurePlaceholder, undefined, emptyState);
        expect(resolveSinglePlaceholderValue(measurePlaceholder, stateWithUpdatedMeasure)).toBe(testMeasure);
    });
});

describe("resolveGroupPlaceholderValue", () => {
    it("should resolve default value", () => {
        const defaultValue = [testMeasure, measurePlaceholder];
        const groupPlaceholder = newMeasureGroupPlaceholder(defaultValue);
        expect(resolveGroupPlaceholderValue(groupPlaceholder, emptyState)).toBe(defaultValue);
    });

    it("should resolve active value", () => {
        const defaultValue = [testMeasure, measurePlaceholder];
        const groupPlaceholder = newMeasureGroupPlaceholder(defaultValue);
        const activeValue = [newMeasure("updated-measure")];
        const updatedState = setPlaceholder(groupPlaceholder, activeValue, emptyState);
        expect(resolveGroupPlaceholderValue(groupPlaceholder, updatedState)).toBe(activeValue);
    });

    it("should fallback to default value, when active value is not defined", () => {
        const defaultValue = [testMeasure, measurePlaceholder];
        const groupPlaceholder = newMeasureGroupPlaceholder(defaultValue);
        const stateWithUpdatedMeasure = setPlaceholder(groupPlaceholder, undefined, emptyState);
        expect(resolveGroupPlaceholderValue(groupPlaceholder, stateWithUpdatedMeasure)).toBe(defaultValue);
    });
});

describe("resolveFullGroupPlaceholderValue", () => {
    it("should resolve nested single placeholder", () => {
        const defaultValue = [measurePlaceholder];
        const groupPlaceholder = newMeasureGroupPlaceholder(defaultValue);
        expect(resolveFullGroupPlaceholderValue(groupPlaceholder, emptyState)).toEqual([testMeasure]);
    });

    it("should resolve nested group placeholder and flatten the resolved value", () => {
        const defaultValue = [measureGroupPlaceholder];
        const groupPlaceholder = newGroupPlaceholder(defaultValue);
        expect(resolveFullGroupPlaceholderValue(groupPlaceholder, emptyState)).toEqual([
            testMeasure,
            testMeasure,
        ]);
    });

    it("should resolve mixed nested placeholders and flatten the resolved value", () => {
        const defaultValue = [measurePlaceholder, measureGroupPlaceholder];
        const groupPlaceholder = newGroupPlaceholder(defaultValue);
        expect(resolveFullGroupPlaceholderValue(groupPlaceholder, emptyState)).toEqual([
            testMeasure,
            testMeasure,
            testMeasure,
        ]);
    });

    it("should keep other values in the group untouched", () => {
        const defaultValue = [undefined, null, {}, [], testMeasure, testAttribute, testFilter, testSort];
        const groupPlaceholder = newGroupPlaceholder(defaultValue);
        expect(resolveFullGroupPlaceholderValue(groupPlaceholder, emptyState)).toEqual(defaultValue);
    });
});

describe("resolveComputedPlaceholderValue", () => {
    it("should resolve value", () => {
        const placeholder = newComputedPlaceholder(
            [measurePlaceholder, filterPlaceholder],
            ([measure, filter]) => {
                return modifySimpleMeasure(measure, (m) => m.filters(filter));
            },
        );

        expect(resolveComputedPlaceholderValue(placeholder, emptyState)).toEqual(computedPlaceholderResult);
    });

    it("should resolve active value", () => {
        const measurePlaceholder = newMeasurePlaceholder(testMeasure);
        const filterPlaceholder = newFilterPlaceholder(testFilter);
        const updatedMeasure = newMeasure("updated-measure");
        const updatedFilter = newPositiveAttributeFilter("updated-attribute", { values: ["Updated"] });
        const placeholder = newComputedPlaceholder(
            [measurePlaceholder, filterPlaceholder],
            ([measure, filter]) => {
                return modifySimpleMeasure(measure, (m) => m.filters(filter));
            },
        );
        const expectedResolvedValue = modifySimpleMeasure(updatedMeasure, (m) => m.filters(updatedFilter));

        let updatedState = setPlaceholder(measurePlaceholder, updatedMeasure, emptyState);
        updatedState = setPlaceholder(filterPlaceholder, updatedFilter, updatedState);

        expect(resolveComputedPlaceholderValue(placeholder, updatedState)).toEqual(expectedResolvedValue);
    });
});

describe("resolveValueWithPlaceholders", () => {
    describe("should not touch value that is not placeholder", () => {
        type Scenario = [scenarioName: string, value: any];

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

    // should remove resolved empty placeholder values
    describe("should resolve default single placeholder value", () => {
        type Scenario = [scenarioName: string, value: any, resolvedValue: any];

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

    describe("should resolve default group placeholder value", () => {
        type Scenario = [scenarioName: string, value: any, resolvedValue: any];

        const scenarios: Scenario[] = [
            ["measureGroupPlaceholder", measureGroupPlaceholder, [testMeasure, testMeasure]],
            ["attributeGroupPlaceholder", attributeGroupPlaceholder, [testAttribute, testAttribute]],
            ["filterGroupPlaceholder", filterGroupPlaceholder, [testFilter, testFilter]],
            ["sortGroupPlaceholder", sortGroupPlaceholder, [testSort, testSort]],
        ];

        it.each(scenarios)("%s", (_, value, expectedValue) => {
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual(expectedValue);
        });
    });

    describe("should resolve computed placeholder value", () => {
        type Scenario = [scenarioName: string, value: any];

        const scenarios: Scenario[] = [["computedPlaceholder", computedPlaceholder]];

        it.each(scenarios)("%s", (_, value) => {
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual(computedPlaceholderResult);
        });
    });

    describe("should resolve array with placeholders", () => {
        it("should keep values that are not placeholders untouched", () => {
            const value = [undefined, null, {}, [], testMeasure, testAttribute, testFilter, testSort];

            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual(value);
        });

        it("should resolve array with single placeholders", () => {
            const value = [measurePlaceholder, attributePlaceholder, filterPlaceholder, sortPlaceholder];

            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([
                testMeasure,
                testAttribute,
                testFilter,
                testSort,
            ]);
        });

        it("should resolve array with group placeholders and flatten their resolved values", () => {
            const value = [measureGroupPlaceholder, attributeGroupPlaceholder];

            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([
                testMeasure,
                testMeasure,
                testAttribute,
                testAttribute,
            ]);
        });

        it("should resolve array with computed placeholders", () => {
            const value = [computedPlaceholder];
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([computedPlaceholderResult]);
        });

        it("should resolve array with mixed placeholders", () => {
            const value = [measurePlaceholder, attributeGroupPlaceholder, computedPlaceholder];
            expect(resolveValueWithPlaceholders(value, emptyState)).toEqual([
                testMeasure,
                testAttribute,
                testAttribute,
                computedPlaceholderResult,
            ]);
        });
    });
});
