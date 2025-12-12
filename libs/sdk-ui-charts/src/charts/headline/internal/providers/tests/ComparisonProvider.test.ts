// (C) 2023-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    TEST_BUCKETS,
    TEST_DATE_FORMAT,
    TEST_EXECUTION_CONFIG,
    TEST_EXECUTION_FACTORY,
    TEST_FILTERS,
    TEST_SORT_ITEMS,
} from "./TestData.fixtures.js";
import { CalculateAs, type CalculationType, type IComparison } from "../../../../../interfaces/index.js";
import { ComparisonProvider } from "../ComparisonProvider.js";

describe("ComparisonProvider", () => {
    const newProvider = (comparison: IComparison) => {
        return new ComparisonProvider(comparison);
    };

    describe("createExecution", () => {
        const specs: [string, CalculationType][] = [
            ["change", undefined],
            ["change", CalculateAs.CHANGE],
            ["ratio", CalculateAs.RATIO],
            ["difference", CalculateAs.DIFFERENCE],
            ["change (difference)", CalculateAs.CHANGE_DIFFERENCE],
        ];

        it.each<[string, CalculationType]>(specs)(
            "Should build execution with %s operator when provided calculation is %s",
            (_operator: string, calculationType: CalculationType) => {
                const comparison: IComparison = {
                    enabled: true,
                    calculationType,
                };

                const execution = newProvider(comparison).createExecution(TEST_EXECUTION_FACTORY, {
                    buckets: TEST_BUCKETS,
                    filters: TEST_FILTERS,
                    executionConfig: TEST_EXECUTION_CONFIG,
                    dateFormat: TEST_DATE_FORMAT,
                    sortItems: TEST_SORT_ITEMS,
                });

                expect(execution).toMatchSnapshot();
            },
        );
    });
});
