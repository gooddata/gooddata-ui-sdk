// (C) 2023-2025 GoodData Corporation
import { describe, it, expect } from "vitest";
import { MockProvider } from "./MockProvider.js";
import {
    TEST_EXECUTION_FACTORY,
    TEST_BUCKETS,
    TEST_FILTERS,
    TEST_EXECUTION_CONFIG,
    TEST_DATE_FORMAT,
    TEST_SORT_ITEMS,
} from "./TestData.fixtures.js";

describe("AbstractProvider", () => {
    const provider = new MockProvider();

    describe("createExecution", () => {
        it("execution should be created", () => {
            const execution = provider.createExecution(TEST_EXECUTION_FACTORY, {
                buckets: TEST_BUCKETS,
                filters: TEST_FILTERS,
                executionConfig: TEST_EXECUTION_CONFIG,
                dateFormat: TEST_DATE_FORMAT,
                sortItems: TEST_SORT_ITEMS,
            });

            expect(execution).toMatchSnapshot();
        });

        it("execution should be created without dateFormat and sortItems", () => {
            const execution = provider.createExecution(TEST_EXECUTION_FACTORY, {
                buckets: TEST_BUCKETS,
                filters: TEST_FILTERS,
                executionConfig: TEST_EXECUTION_CONFIG,
            });

            expect(execution).toMatchSnapshot();
        });
    });
});
