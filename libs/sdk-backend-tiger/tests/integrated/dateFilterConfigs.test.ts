// (C) 2022-2025 GoodData Corporation
import { describe, beforeAll, expect, it } from "vitest";
import { testBackend, testWorkspace } from "./backend.js";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

// Helper function to sanitize results by removing filters with boundedFilter
function filtersWithoutToDateFilters(result) {
    const queryResult = { ...result };

    if (queryResult.items) {
        queryResult.items = queryResult.items.map((item) => {
            if (item.relativePresets) {
                return {
                    ...item,
                    relativePresets: item.relativePresets.filter((preset) => !preset.boundedFilter),
                };
            }
            return item;
        });
    }

    return queryResult;
}

describe("tiger dateFilterConfigs", () => {
    it("should load date filter configs", async () => {
        const result = await backend
            .workspace(testWorkspace())
            .dateFilterConfigs()
            .withOffset(0)
            .withLimit(10)
            .query();

        const sanitizedResult = filtersWithoutToDateFilters(result);
        expect(sanitizedResult).toMatchSnapshot();
    });

    it("should load empty date filter configs for out-of-range page", async () => {
        const result = await backend
            .workspace(testWorkspace())
            .dateFilterConfigs()
            .withOffset(0)
            .withLimit(10)
            .query();

        const page = await result.goTo(4);
        const sanitizedPage = filtersWithoutToDateFilters(page);
        expect(sanitizedPage).toMatchSnapshot();
    });
});
